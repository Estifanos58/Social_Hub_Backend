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
import { ChatroomDto, MessageDto, UserDto } from 'src/types';
import { CreateChatroomCommand } from '../chatroom/commands/CreateChatroom.command';
import { CreateMessageCommand } from './commands/CreateMessage.command';
import { GetMessagesQuery } from './query/GetMessages.query';
import { redisPubSub } from 'src/pubsub';


type SubscriptionContext = { pubSub?: RedisPubSub };
type RequestContext = { req: Request; pubSub?: RedisPubSub };

@Resolver()
export class MessageResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prismaService: PrismaService,
  ) {
  }

  
  private getPubSub(context?: SubscriptionContext) {
    return context?.pubSub ?? redisPubSub;
  }


  @UseGuards(GraphQLAuthGuard)
  @Query(() => [MessageDto])
  async messagesBetweenUsers(
    @Args('otherUserId', { nullable: true }) otherUserId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Args('offset', { type: () => Int, nullable: true }) offset: number,
    @Context() context: { req: Request },
  ) {
    const userId = context.req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!otherUserId) {
      throw new BadRequestException(
        'Provide the other user id for direct chats or the group chatroom id',
      );
    }

    return this.queryBus.execute(
      new GetMessagesQuery(userId, otherUserId, limit, offset),
    );
  }

  // Subbscription For New Messages
  @Subscription(() => MessageDto, {
    nullable: true,
    resolve: (value) => value.newMessage,
  })
  newMessage(
  @Args('chatroomId') chatroomId?: string,
  @Args('userId') userId?: string,
  @Context() context?: SubscriptionContext,
  ) {
    const pubSub = this.getPubSub(context);
    // console.log("Subscription args:", { chatroomId, userId, otherUserId });

    if (chatroomId) {
      return pubSub.asyncIterableIterator(`newMessage.${chatroomId}`);
    }

    // if (!otherUserId) {
    //   throw new BadRequestException(
    //     'otherUserId is required when chatroomId is not provided',
    //   );
    // }

  }

  @UseGuards(GraphQLAuthGuard)
  @Mutation(() => MessageDto)
  async createMessageMutation(
  @Args('chatroomId', { nullable: true }) chatroomId: string,
  @Args('otherUserId', { nullable: true }) otherUserId: string,
  @Args('content', { nullable: true }) content: string,
  @Args('imageUrl', { nullable: true }) imageUrl: string,
  @Context() context: RequestContext,
  ) {
    const userId = context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if ((!content || !content.trim()) && !imageUrl) {
      throw new BadRequestException('Message must include content or an image');
    }

    let targetChatroomId = chatroomId;
    let chatroom: ChatroomDto | null = null;
    let createdNewChatroom = false;

    if (!targetChatroomId) {
      if (!otherUserId) {
        throw new BadRequestException(
          'otherUserId is required when chatroomId is not provided',
        );
      }

      const createdChatroom = await this.commandBus.execute(
        new CreateChatroomCommand(userId, otherUserId, false, undefined, undefined),
      );

      if (!createdChatroom) {
        throw new NotFoundException('Chatroom could not be created');
      }

      chatroom = createdChatroom;
      targetChatroomId = createdChatroom.id;
      createdNewChatroom = true;
    }

    const message = await this.commandBus.execute(
      new CreateMessageCommand(userId, targetChatroomId, content, imageUrl),
    );

    const pubSub = this.getPubSub(context);

    await pubSub.publish(`newMessage.${targetChatroomId}`, {
      newMessage: message,
    });

    if (createdNewChatroom && otherUserId) {
      const timestamp = message.createdAt ?? new Date();
      await pubSub.publish(`createChatroom.${otherUserId}`, {
        newMessage: {
          ...message,
          createdAt: timestamp,
          updatedAt: message.updatedAt ?? timestamp,
          chatroom: message.chatroom ?? chatroom,
        },
      });
    }

    return message;
  }


  @Subscription(() => UserDto, {
    nullable: true,
    resolve: (value) => value.user,
    filter: (payload, variables) => {
      return payload.typingUserId !== variables.userId;
    },
  })
  userStatedTyping(
    @Args('chatroomId') chatroomId: string,
    @Args('userId') userId: string,
    @Context() context?: SubscriptionContext,
  ) {
    return this.getPubSub(context).asyncIterableIterator(
      `userStartedTyping.${chatroomId}`,
    );
  }

  @UseGuards(GraphQLAuthGuard)
  @Mutation(() => UserDto)
  async userStartedTypingMutation(
    @Args('chatroomId') chatroomId: string,
    @Context() context: RequestContext,
  ) {
    const userId = context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    const pubSub = this.getPubSub(context);
    await pubSub.publish(`userStartedTyping.${chatroomId}`, {
      user,
      typingUserId: userId,
    });
    return user;
  }


  @Subscription(() => UserDto, {
    nullable: true,
    resolve: (value) => value.user,
    filter: (payload, variables) => {
      return payload.typingUserId !== variables.userId;
    }
  })
  userStoppedTyping(
    @Args('chatroomId') chatroomId: string,
    @Args('userId') userId: string,
    @Context() context?: SubscriptionContext,
  ) {
    return this.getPubSub(context).asyncIterableIterator(
      `userStoppedTyping.${chatroomId}`,
    );
  }

  @UseGuards(GraphQLAuthGuard)
  @Mutation(() => UserDto)
  async userStoppedTypingMutation(
    @Args('chatroomId') chatroomId: string,
    @Context() context: RequestContext,
    ) {
    const userId = context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    const pubSub = this.getPubSub(context);
    await pubSub.publish(`userStoppedTyping.${chatroomId}`, {
      user,
      typingUserId: userId,
    });
    return user;
    }

    
}
