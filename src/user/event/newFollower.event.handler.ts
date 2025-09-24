import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from 'src/notification/notification.service';
import { NewFollowerEvent } from './newFollower.event';

@Injectable()
export class NewFollowerEventHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('user.followed')
  async handle(event: NewFollowerEvent) {
    const { followerId, followingId } = event;
    if (followerId === followingId) return;
    await this.notifications.newFollower(followingId, followerId);
  }
}
