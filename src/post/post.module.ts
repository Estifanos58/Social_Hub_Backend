import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  AddReactionHandler,
  CreatePostHandler,
  DeletePostHandler,
  GetPostHandler,
  GetPostsHandler,
  RemoveReactionHandler,
} from './handler';
import { NotificationModule } from 'src/notification/notification.module';
import { PostReactionEventHandler } from './event/postReaction.event.handler';
import { PostDeletedEventHandler } from './event/postDeleted.event.handler';

const CommandHandlers = [CreatePostHandler, DeletePostHandler, AddReactionHandler, RemoveReactionHandler];
const QueryHandler = [GetPostsHandler, GetPostHandler];
@Module({
  imports: [CqrsModule, ConfigModule, NotificationModule],
  providers: [
    PostResolver,
    JwtService,
    PrismaService,
    ...CommandHandlers,
    ...QueryHandler,
    PostReactionEventHandler,
    PostDeletedEventHandler,
  ],
})
export class PostModule {}
