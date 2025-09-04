import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import {
  ForgotPasswordHandler,
  GetUserHandler,
  GoogleOAuthHandler,
  LoginHandler,
  RegisterHandler,
} from './handlers';
import {
  EmailConfirmedEventHandler,
  ForgotPasswordEventHandler,
  VerificationTokenEventHandler,
} from './event';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  GoogleOAuthHandler,
  ForgotPasswordHandler,
];
const EventHandlers = [
  VerificationTokenEventHandler,
  EmailConfirmedEventHandler,
  ForgotPasswordEventHandler,
];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [CqrsModule, HttpModule, ConfigModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthResolver,
    PrismaService,
    JwtService,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class AuthModule {}
