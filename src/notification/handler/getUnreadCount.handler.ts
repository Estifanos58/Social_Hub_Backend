import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma.service';
import { GetUnreadCountQuery } from '../query/getUnreadCount.query';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler implements IQueryHandler<GetUnreadCountQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUnreadCountQuery) {
    const { userId } = query;
    const count = await this.prisma.notification.count({ where: { recipientId: userId, isRead: false } });
    return count;
  }
}
