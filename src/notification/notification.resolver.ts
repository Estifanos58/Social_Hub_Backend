import { UseGuards } from '@nestjs/common';
import { Query, Resolver, Args, Context, Int } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GraphQLAuthGuard } from 'src/auth/graphql-auth.guard';
import { Request } from 'express';
import { NotificationDto } from 'src/types';
import { GetNotificationsQuery } from './query/getNotifications.query';
import { GetUnreadCountQuery } from './query/getUnreadCount.query';

@Resolver()
export class NotificationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(GraphQLAuthGuard)
  @Query(() => [NotificationDto])
  async notifications(
    @Args('take', { type: () => Int, nullable: true }) take: number,
    @Args('cursor', { nullable: true }) cursor: string,
    @Context() context: { req: Request },
  ) {
    const userId = context.req.user?.sub!;
    return this.queryBus.execute(new GetNotificationsQuery(userId, take, cursor));
  }

  @UseGuards(GraphQLAuthGuard)
  @Query(() => Int)
  async unreadNotificationsCount(
    @Context() context: { req: Request },
  ) {
    const userId = context.req.user?.sub!;
    return this.queryBus.execute(new GetUnreadCountQuery(userId));
  }
}
