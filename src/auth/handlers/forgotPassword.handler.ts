import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForgotPasswordCommand } from "../commands/forgotPassword.command";
import { PrismaService } from "src/prisma.service";
import { HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ForgotPasswordEvent } from "../event/forgotPassword.event";

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
    constructor(
        private readonly prismaService: PrismaService, 
        private readonly eventEmitter: EventEmitter2
    ){}

    async execute(command: ForgotPasswordCommand): Promise<any> {
        const {email, userId} = command

        try {
            const credential =  await this.prismaService.credential.findUnique({
                where : {userId, user: { email }},
                include: { user: true}
            })

            if(!credential){
                throw new NotFoundException('User Not Found')
            }

            const token = generateVerificationCode()
            const tokenExpriresAt = new Date(Date.now() + 15 * 60 * 1000);

            if(credential.googleId){
                throw new HttpException("Login With Google", HttpStatus.BAD_REQUEST)
            }

            await this.prismaService.credential.update({
                where: {userId},
                data: {
                    resetToken: token,
                    resetTokenExpiry: tokenExpriresAt
                }
            });

            this.eventEmitter.emit('resetpasswordsent.token', new ForgotPasswordEvent(credential.user.firstname, credential.user.email, token))

            return "Password Reset Token Sent"

        } catch (error) {
            if(error instanceof HttpException) throw error
            throw new InternalServerErrorException("Internal Server Error")
        }
    }
}