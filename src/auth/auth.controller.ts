import { Controller, Post, Query, Res } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { GoogleOAuthCommand } from "./commands/google.oauth.command";
import { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus
    ){}

    @Post('google')
    async googleOAuth(
        @Query('code') code: string,
        @Res() res: Response

    ) {
        return this.commandBus.execute(new GoogleOAuthCommand(code, res))
    }
}