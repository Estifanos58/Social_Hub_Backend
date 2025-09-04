import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifiEmailCommand } from '../commands/verifyEmail.command';
import { PrismaService } from 'src/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailConfirmedEvent } from '../event/emailConfirmed.event';

@CommandHandler(VerifiEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifiEmailCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
) {}

  async execute(command: VerifiEmailCommand){
    const { token, userId } = command;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { credential: true },
    });

    if (
      !user ||
      user.credential?.verificationToken !== token ||
      user.credential.verificationTokenExpiry! < new Date()
    ) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        verified: true,
        credential: {
          update: {
            verificationToken: null,
            verificationTokenExpiry: null,
          },
        },
      },
    });

    this.eventEmitter.emit('user.verified', new EmailConfirmedEvent(user.email));

    return user;
  }
}
