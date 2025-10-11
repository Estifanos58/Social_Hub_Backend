import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { MessageResolver } from './message.resolver';
import {
	AddUserToChatroomHandler,
	CreateChatroomHandler,
	CreateMessageHandler,
	GetMessagesHandler,
  GetChatroomDetailHandler,
} from './handlers';

const CommandHandlers = [
	CreateChatroomHandler,
	AddUserToChatroomHandler,
	CreateMessageHandler,
];

const QueryHandlers = [
	GetMessagesHandler,
	GetChatroomDetailHandler,
]  

@Module({
	imports: [CqrsModule, ConfigModule],
	providers: [MessageResolver, PrismaService, JwtService, ...CommandHandlers, ...QueryHandlers],
})
export class MessageModule {}
