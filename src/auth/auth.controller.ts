import { Controller, Get, Post, Query, Res } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { GoogleOAuthCommand } from "./commands/google.oauth.command";
import { Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
    ){}

    @Get('google')
    async googleOAuth(
        @Query('code') code: string,
        @Res() res: Response

    ) {
        // console.log("Google OAuth endpoint hit");
        const auth =  this.commandBus.execute(new GoogleOAuthCommand(code, res));
        
        // return 
    }
}