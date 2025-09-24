import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from 'src/notification/notification.service';
import { CommentCreatedEvent } from './commentCreated.event';

@Injectable()
export class CommentCreatedEventHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('comment.created')
  async handle(event: CommentCreatedEvent) {
    const { postId, commentId, postOwnerId, commenterId, excerpt } = event;
    if (postOwnerId === commenterId) return; // avoid self-notify
    await this.notifications.commentOnPost(postOwnerId, commenterId, postId, commentId, { excerpt });
  }
}
