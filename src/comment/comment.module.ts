import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { CommentResolver } from './comment.resolver';
import { CreateCommentHandler, GetPostCommentsHandler, GetCommentRepliesHandler } from './handler';
import { PrismaService } from 'src/prisma.service';
import { NotificationModule } from 'src/notification/notification.module';
import { CommentCreatedEventHandler } from './event/commentCreated.event.handler';
import { ReplyCreatedEventHandler } from './event/replyCreated.event.handler';

const CommandHandlers = [CreateCommentHandler];
const QueryHandlers = [GetPostCommentsHandler, GetCommentRepliesHandler];

@Module({
  imports: [CqrsModule, NotificationModule],
  providers: [
    CommentResolver,
    JwtService,
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
    CommentCreatedEventHandler,
    ReplyCreatedEventHandler,
  ],
})
export class CommentModule {}
