import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResetPasswordCommand } from "../commands/resetPassword.command";
import { PrismaService } from "src/prisma.service";
import { HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import * as bcrypt from 'bcrypt';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ){}
    async execute(command: ResetPasswordCommand): Promise<any> {
        const {userId, resetToken, newPassword} = command

        try {
            
            const credential = await this.prismaService.credential.findUnique({
                where: {userId, resetToken},
                include: { user: true}
            })

            if(!credential || credential.resetTokenExpiry! < new Date()){
                throw new HttpException("Invalid or Expired Token", HttpStatus.BAD_REQUEST)
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.prismaService.credential.update({
                where: {userId},
                data: {
                    passwordHash: hashedPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            })


            this.eventEmitter.emit('password.reset', {email: credential.user.email, firstname: credential.user.firstname})

            return credential.user


        } catch (error) {
            if(error instanceof HttpException) throw error
            throw new InternalServerErrorException("Internal Server Error")
        }
    }
}