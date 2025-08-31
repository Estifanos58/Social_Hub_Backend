import { Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus
    ){}

    @Post('google')
    async googleOAuth() {
        
    }
}