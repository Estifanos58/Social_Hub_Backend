import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from 'src/notification/notification.service';
import { PostDeletedEvent } from './postDeleted.event';

@Injectable()
export class PostDeletedEventHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('post.deleted')
  async handle(event: PostDeletedEvent) {
    const { postId, ownerId, reason } = event;
    await this.notifications.postDeleted(ownerId, postId, { reason });
  }
}
