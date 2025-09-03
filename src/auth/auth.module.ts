import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterHandler } from './handlers/register.handler';
import { LoginHandler } from './handlers/login.handler';
import { AuthController } from './auth.controller';
import { GoogleOAuthHandler } from './handlers/google.oauth.handler';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';

const CommandHandlers = [RegisterHandler, LoginHandler, GoogleOAuthHandler];
@Module({
  imports: [CqrsModule, HttpModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthResolver,AuthService , PrismaService, JwtService, ...CommandHandlers]
})
export class AuthModule {}
