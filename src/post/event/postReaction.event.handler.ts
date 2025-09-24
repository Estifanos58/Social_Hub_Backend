import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from 'src/notification/notification.service';
import { PostReactionEvent } from './postReaction.event';

@Injectable()
export class PostReactionEventHandler {
  constructor(private readonly notifications: NotificationService) {}

  @OnEvent('post.reacted')
  async handle(event: PostReactionEvent) {
    const { postId, reactorId, postOwnerId, reactionId, reactionType } = event;
    if (postOwnerId === reactorId) return;
    await this.notifications.reactionOnPost(postOwnerId, reactorId, postId, reactionId, { reactionType });
  }
}
