import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from 'src/notification/notification.service';
import { ReplyCreatedEvent } from './replyCreated.event';

@Injectable()
export class ReplyCreatedEventHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('comment.replyCreated')
  async handle(event: ReplyCreatedEvent) {
    const { parentCommentId, replyCommentId, parentOwnerId, replierId, excerpt } = event;
    if (parentOwnerId === replierId) return; // avoid self-notify
    await this.notifications.replyOnComment(parentOwnerId, replierId, parentCommentId, replyCommentId, { excerpt });
  }
}
