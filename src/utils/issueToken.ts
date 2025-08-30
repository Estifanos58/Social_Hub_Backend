import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { Response } from "express";

export const issueToken = (user: User, jwtService: JwtService, configService: ConfigService, response: Response) => {
    const payload = { sub: user.id, email: user.email };

    const accessToken = jwtService.sign(payload, {
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
    });

    const refreshToken = jwtService.sign(payload, {
        secret: configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
    });

    response.cookie('refreshToken', refreshToken, { httpOnly: true })
    response.cookie('accessToken', accessToken, { httpOnly: true })

    return { user }
}