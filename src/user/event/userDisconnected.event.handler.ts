import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma.service';
import { UserDisconnectedEvent } from './userDisconnected.event';

@Injectable()
export class UserDisconnectedEventHandler {
  private readonly logger = new Logger(UserDisconnectedEventHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('user.disconnected', { async: true })
  async handle(event: UserDisconnectedEvent) {
    const { userId, disconnectedAt } = event;

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: disconnectedAt },
      });
    } catch (error) {
      this.logger.error(`Failed to update lastSeenAt for user ${userId}`, error as Error);
    }
  }
}
