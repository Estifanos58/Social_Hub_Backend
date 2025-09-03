import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../commands/register.command';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { issueToken } from 'src/utils/issueToken';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VerificationTokenEvent } from '../event/verificationToken.event';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {}
  async execute(command: RegisterCommand): Promise<any> {
    const { email, password, firstname, lastname, res } = command;
    // console.log('Hey from RegisterHandler');
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = generateVerificationCode();
      const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      const newUser = await this.prisma.user.create({
        data: {
          email,
          firstname,
          lastname,
          credential: { create: { passwordHash: hashedPassword, verificationToken, verificationTokenExpiry } },
        },
      });

      this.eventEmitter.emit('verification.token', new VerificationTokenEvent(newUser, verificationToken));

      return issueToken(newUser, this.jwtService, this.configService, res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }else throw new InternalServerErrorException('Failed to register user');
    }
  }
}
