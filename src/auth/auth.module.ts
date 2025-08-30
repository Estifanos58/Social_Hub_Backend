import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterHandler } from './handlers/register.handler';

const CommandHandlers = [RegisterHandler];
@Module({
  imports: [CqrsModule],
  providers: [AuthResolver, PrismaService, JwtService, ...CommandHandlers]
})
export class AuthModule {}
