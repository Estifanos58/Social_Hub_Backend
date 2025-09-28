import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatroomRole } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateChatroomCommand } from '../commands/CreateChatroom.command';

@CommandHandler(CreateChatroomCommand)
export class CreateChatroomHandler
  implements ICommandHandler<CreateChatroomCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: CreateChatroomCommand) {
    const { userId, otherUserId, isGroupChat, chatroomName } = command;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const creator = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!creator) {
      throw new NotFoundException('User not found');
    }

    const isGroup = Boolean(isGroupChat);

    if (!isGroup && !otherUserId) {
      throw new BadRequestException(
        'otherUserId is required when creating a direct chat',
      );
    }

    if (!isGroup && otherUserId === userId) {
      throw new BadRequestException('Cannot create a direct chat with yourself');
    }

    if (otherUserId) {
      const otherUser = await this.prismaService.user.findUnique({
        where: { id: otherUserId },
      });
      if (!otherUser) {
        throw new NotFoundException('Other user not found');
      }
    }

    if (!isGroup && otherUserId) {
      const existingChatroom = await this.prismaService.chatroom.findFirst({
        where: {
          isGroup: false,
          deletedAt: null,
          AND: [
            { memberships: { some: { userId } } },
            { memberships: { some: { userId: otherUserId } } },
          ],
        },
        include: {
          createdBy: true,
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      if (existingChatroom) {
        return existingChatroom;
      }
    }

    try {
      const chatroom = await this.prismaService.chatroom.create({
        data: {
          name: chatroomName ?? null,
          isGroup,
          createdById: userId,
          memberships: {
            create: [
              {
                userId,
                role: ChatroomRole.OWNER,
              },
              ...(otherUserId
                ? [
                    {
                      userId: otherUserId,
                      role: ChatroomRole.MEMBER,
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          createdBy: true,
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });

      return chatroom;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create chatroom');
    }
  }
}
