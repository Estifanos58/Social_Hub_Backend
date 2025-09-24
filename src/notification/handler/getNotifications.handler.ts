import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma.service';
import { GetNotificationsQuery } from '../query/getNotifications.query';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetNotificationsQuery) {
    const { userId, take = 20, cursor } = query;
    return this.prisma.notification.findMany({
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
  }
}
