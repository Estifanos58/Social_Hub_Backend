import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { Response } from "express";

export const ACCESS_TOKEN_EXPIRES_AT = '1hr'
export const REFRESH_TOKEN_EXPRIRES_AT = '15d'

export const issueToken = (user: User, jwtService: JwtService, configService: ConfigService, response: Response) => {
    const payload = { sub: user.id, email: user.email, firstname: user.firstname };

    const accessToken = jwtService.sign(payload, {
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRES_AT,
    });

    const refreshToken = jwtService.sign(payload, {
        secret: configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPRIRES_AT,
    });

    response.cookie('refreshToken', refreshToken, { httpOnly: true })
    response.cookie('accessToken', accessToken, { httpOnly: true })

    return { user }
}