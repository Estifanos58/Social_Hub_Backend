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
  GetCurrentUserHandler,
  GoogleOAuthHandler,
  LoginHandler,
  RegisterHandler,
  ResetPasswordHandler,
  VerifyEmailHandler,
} from './handlers';
import {
  EmailConfirmedEventHandler,
  ForgotPasswordEventHandler,
  ResetPasswordEventHandler,
  VerificationTokenEventHandler,
} from './event';
import { GithubOAuthHandler } from './handlers/github.oauth.handler';

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  GoogleOAuthHandler,
  GithubOAuthHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  VerifyEmailHandler
];
const EventHandlers = [
  VerificationTokenEventHandler,
  EmailConfirmedEventHandler,
  ForgotPasswordEventHandler,
  ResetPasswordEventHandler
];
const QueryHandlers = [GetCurrentUserHandler];

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
