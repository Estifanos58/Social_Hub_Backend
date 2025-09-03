import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginCommand } from "../commands/login.command";
import { PrismaService } from "src/prisma.service";
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from "@nestjs/common";
import { issueToken } from "src/utils/issueToken";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ){}
    async execute(command: LoginCommand) {
        const { email, password, res } = command;
        
        const user = await this.prismaService.user.findUnique({
            where: { email },
            include: { credential: true }
        });

        if(!user) {
            throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED)
        }


        if(!bcrypt.compareSync(password, user.credential!.passwordHash! )){
            throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
         return issueToken(user, this.jwtService, this.configService, res);
    }
}