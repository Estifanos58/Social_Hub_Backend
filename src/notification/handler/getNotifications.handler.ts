import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma.service';
import { GetNotificationsQuery } from '../query/getNotifications.query';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetNotificationsQuery) {
    const { userId, take = 20, cursor } = query;
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: true,
        recipient: true,
        post: {
          include: {
            images: true,
          },
        },
        comment: true,
        reaction: true,
      },
    });

    // Mark all unread notifications in this batch as read (fire and forget)
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      this.prisma.notification.updateMany({
        where: { id: { in: unreadIds }, recipientId: userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      }).catch(() => {}); // ignore errors
    }

    return notifications;
  }
}
