import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';

interface BaseCreateInput {
  recipientId: string;
  actorId?: string | null;
  metadata?: Prisma.JsonValue;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(input: BaseCreateInput & {
    type: NotificationType;
    postId?: string | null;
    commentId?: string | null;
    reactionId?: string | null;
  }) {
    const { type, recipientId, actorId, postId, commentId, reactionId, metadata } = input;
    return this.prisma.notification.create({
      data: {
        type,
        recipientId,
        actorId: actorId ?? null,
        postId: postId ?? null,
        commentId: commentId ?? null,
        reactionId: reactionId ?? null,
        metadata: metadata ?? undefined,
      },
    });
  }

  // Specific helpers
  login(recipientId: string, metadata?: Prisma.JsonValue) {
    return this.create({ type: NotificationType.LOGIN, recipientId, actorId: null, metadata });
  }

  commentOnPost(recipientId: string, actorId: string, postId: string, commentId: string, metadata?: Prisma.JsonValue) {
    return this.create({ type: NotificationType.COMMENT_ON_POST, recipientId, actorId, postId, commentId, metadata });
  }

  replyOnComment(recipientId: string, actorId: string, parentCommentId: string, replyCommentId: string, metadata?: Prisma.JsonValue) {
    return this.create({ type: NotificationType.REPLY_ON_COMMENT, recipientId, actorId, commentId: replyCommentId, metadata: { parentCommentId, ...(metadata as any) } });
  }

  reactionOnPost(recipientId: string, actorId: string, postId: string, reactionId: string, metadata?: Prisma.JsonValue) {
    return this.create({ type: NotificationType.REACTION_ON_POST, recipientId, actorId, postId, reactionId, metadata });
  }

  newFollower(recipientId: string, actorId: string, metadata?: Prisma.JsonValue) {
    return this.create({ type: NotificationType.NEW_FOLLOWER, recipientId, actorId, metadata });
  }

  postDeleted(recipientId: string, postId: string, metadata?: Prisma.JsonValue) {
    // Actor can be the recipient or system; keeping it null here unless provided in metadata
    return this.create({ type: NotificationType.POST_DELETED, recipientId, actorId: null, postId, metadata });
  }
}
