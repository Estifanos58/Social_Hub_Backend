import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { MessageResolver } from './message.resolver';
import {
	CreateMessageHandler,
	GetMessagesHandler,
} from './handlers';
import { ChatroomModule } from 'src/chatroom/chatroom.module';

const CommandHandlers = [
	CreateMessageHandler,
];

const QueryHandlers = [
	GetMessagesHandler,
]  

@Module({
	imports: [CqrsModule, ConfigModule, ChatroomModule],
	providers: [MessageResolver, PrismaService, JwtService, ...CommandHandlers, ...QueryHandlers],
})
export class MessageModule {}
