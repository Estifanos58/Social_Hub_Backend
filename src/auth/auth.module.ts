import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterHandler } from './handlers/register.handler';
import { LoginHandler } from './handlers/login.handler';

const CommandHandlers = [RegisterHandler, LoginHandler];
@Module({
  imports: [CqrsModule],
  providers: [AuthResolver, PrismaService, JwtService, ...CommandHandlers]
})
export class AuthModule {}
