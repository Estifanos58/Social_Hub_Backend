import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
  Int,
} from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Request } from 'express';
import { GraphQLAuthGuard } from 'src/auth/graphql-auth.guard';
import { PrismaService } from 'src/prisma.service';
import { ChatroomDetailDto, ChatroomDto, MessageDto, UserDto } from 'src/types';
import { CreateChatroomCommand } from './commands/CreateChatroom.command';
import { AddUserToChatroomCommand } from './commands/AddUserToChatroom.command';
import { GetChatroomDetailQuery } from './query/GetChatroomDetail.query';
import { redisPubSub } from 'src/pubsub';


type SubscriptionContext = { pubSub?: RedisPubSub };
type RequestContext = { req: Request; pubSub?: RedisPubSub };

@Resolver()
export class ChatroomResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prismaService: PrismaService,
  ) {
  }

  @UseGuards(GraphQLAuthGuard)
  @Query(() => ChatroomDetailDto)
  async chatroomDetail(
    @Args('chatroomId', { nullable: true }) chatroomId: string,
    @Args('otherUserId', { nullable: true }) otherUserId: string,
    @Context() context: { req: Request },
  ) {
    const userId = context.req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!chatroomId && !otherUserId) {
      throw new BadRequestException('Provide chatroomId or otherUserId');
    }

    return this.queryBus.execute(
      new GetChatroomDetailQuery(chatroomId ?? null, userId, otherUserId ?? null),
    );
  }

  private getPubSub(context?: SubscriptionContext) {
    return context?.pubSub ?? redisPubSub;
  }


  @Subscription(()=> MessageDto, {
    nullable: true,
    resolve: (value) => value.newMessage
  })
  chatroomCreated(
  @Args('otherUserId') otherUserId?: string,
  @Context() context?: SubscriptionContext,
  ){
    const pubSub = this.getPubSub(context);
    return pubSub.asyncIterableIterator(`createChatroom.${otherUserId}`);
  }


  // Create Chatroom Mutation
  @UseGuards(GraphQLAuthGuard)
  @Mutation(() => String)
  async createChatroomMutation(
  @Args('otherUserId', { nullable: true }) otherUserId: string,
  @Args('isGroupChat', { nullable: true }) isGroupChat: boolean,
  @Args('chatroomName', { nullable: true }) chatroomName: string,
  @Args('avatarUrl', { nullable: true }) avatarUrl: string,
  @Context() context: RequestContext,
  ) {
    const userId = context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    const chatroom = await this.commandBus.execute(
      new CreateChatroomCommand(userId, otherUserId, isGroupChat, chatroomName, avatarUrl),
    );
    if (!chatroom) throw new NotFoundException('Chatroom could not be created');
    if (otherUserId) {
      const pubSub = this.getPubSub(context);
      const timestamp = new Date();
      await pubSub.publish(`createChatroom.${otherUserId}`, {
        newMessage: {
          chatroomId: chatroom.id,
          content: '',
          createdAt: timestamp,
          updatedAt: timestamp,
          id: '',
          userId,
          isEdited: false,
          imageUrl: null,
          deletedAt: null,
          user: chatroom.createdBy,
          chatroom,
        },
      });
    }
    return chatroom.id;
  }



  @Subscription(() => ChatroomDto, {
    nullable: true,
    resolve: (value) => value.chatroom,
  })
  userAddedToChatroom(
    @Args('userId') userId: string,
    @Args('otherUserId') otherUserId: string,
  @Args('chatroomId') chatroomId: string,
  @Context() context?: SubscriptionContext,
  ) {
    if (!userId || !chatroomId || !otherUserId) {
      throw new BadRequestException(
        'userId, chatroomId and otherUserId are required',
      );
    }

    return this.getPubSub(context).asyncIterableIterator(
      `userAddedtoChatroom.${otherUserId}`,
    );
  }

  @UseGuards(GraphQLAuthGuard)
  @Mutation(() => [String])
  async addUserToChatroomMutation(
    @Args('userId') userId: string,
    @Args('chatroomId') chatroomId: string,
    @Args('otherUserIds', { type: () => [String] }) otherUserIds: string[],
    @Context() context: RequestContext,
  ) {
    const authenticatedUserId = context.req.user?.sub;
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!chatroomId) {
      throw new BadRequestException('chatroomId is required');
    }

    if (!Array.isArray(otherUserIds) || otherUserIds.length === 0) {
      throw new BadRequestException('Provide at least one otherUserId');
    }

    const { chatroom, addedUserIds } = await this.commandBus.execute(
      new AddUserToChatroomCommand(userId, otherUserIds, chatroomId),
    );

    const pubSub = this.getPubSub(context);

    if (addedUserIds.length > 0) {
      await Promise.all(
        addedUserIds.map(async (addedUserId) => {
          await Promise.all([
            pubSub.publish(`userAddedtoChatroom.${addedUserId}`, {
              chatroom,
            }),
            pubSub.publish(`userAddedtoChatRoom.${addedUserId}`, {
              chatroom,
            }),
          ]);
        }),
      );
    }

    return addedUserIds;
  }

}
