import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { CommentResolver } from './comment.resolver';
import { CreateCommentHandler, GetPostCommentsHandler, GetCommentRepliesHandler } from './handler';
import { PrismaService } from 'src/prisma.service';

const CommandHandlers = [CreateCommentHandler];
const QueryHandlers = [GetPostCommentsHandler, GetCommentRepliesHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    CommentResolver,
    JwtService,
    PrismaService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class CommentModule {}
