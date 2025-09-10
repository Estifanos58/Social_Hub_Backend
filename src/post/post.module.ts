import { Module } from '@nestjs/common';
import { PostResolver } from './post.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  CreatePostHandler,
  DeletePostHandler,
  GetPostHandler,
  GetPostsHandler,
} from './handler';

const CommandHandlers = [CreatePostHandler, DeletePostHandler];
const QueryHandler = [GetPostsHandler, GetPostHandler];
@Module({
  imports: [CqrsModule, ConfigModule],
  providers: [
    PostResolver,
    JwtService,
    PrismaService,
    ...CommandHandlers,
    ...QueryHandler,
  ],
})
export class PostModule {}
