import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { Response } from "express";

export const ACCESS_TOKEN_EXPIRES_AT = "1hr";
export const REFRESH_TOKEN_EXPIRES_AT = "15d";

export const issueToken = (
    user: User,
    jwtService: JwtService,
    configService: ConfigService,
    response: Response,
) => {
    const payload = { sub: user.id, email: user.email, firstname: user.firstname };

    const accessToken = jwtService.sign(payload, {
        secret: configService.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: ACCESS_TOKEN_EXPIRES_AT,
    });

    const refreshToken = jwtService.sign(payload, {
        secret: configService.get<string>("REFRESH_TOKEN_SECRET"),
        expiresIn: REFRESH_TOKEN_EXPIRES_AT,
    });

    const isProduction = configService.get<string>("NODE_ENV") === "production";
    const baseCookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" as const : "lax" as const,
        path: "/",
    };

    response.cookie("refreshToken", refreshToken, {
        ...baseCookieOptions,
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    response.cookie("accessToken", accessToken, {
        ...baseCookieOptions,
        maxAge: 60 * 60 * 1000, // 1 hour
    });

    return { user };
};