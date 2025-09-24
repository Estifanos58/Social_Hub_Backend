import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from 'src/prisma.service';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationResolver } from './notification.resolver';
import { GetNotificationsHandler } from './handler/getNotifications.handler';
import { GetUnreadCountHandler } from './handler/getUnreadCount.handler';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CqrsModule],
  providers: [NotificationService, PrismaService, JwtService, NotificationResolver, GetNotificationsHandler, GetUnreadCountHandler],
  exports: [NotificationService],
})
export class NotificationModule {}
