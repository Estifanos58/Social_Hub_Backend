import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatroomRole, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AddUserToChatroomCommand } from '../commands/AddUserToChatroom.command';

type DetailedChatroom = Prisma.ChatroomGetPayload<{
  include: {
    createdBy: true;
    memberships: {
      include: { user: true };
    };
  };
}>;

@CommandHandler(AddUserToChatroomCommand)
export class AddUserToChatroomHandler
  implements ICommandHandler<AddUserToChatroomCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: AddUserToChatroomCommand): Promise<{
    addedUserIds: string[];
    chatroom: DetailedChatroom;
  }> {
    const { userId, otherUserIds, chatroomId } = command;

    if (!Array.isArray(otherUserIds) || otherUserIds.length === 0) {
      throw new BadRequestException('Provide at least one user to add');
    }

    const uniqueUserIds = Array.from(
      new Set(
        otherUserIds
          .map((id) => id?.trim())
          .filter((id): id is string => Boolean(id) && id !== userId),
      ),
    );

    if (uniqueUserIds.length === 0) {
      throw new BadRequestException('No valid users provided to add');
    }

    const chatroom = await this.prismaService.chatroom.findUnique({
      where: { id: chatroomId },
      include: {
        createdBy: true,
        memberships: {
          include: { user: true },
        },
      },
    });

    if (!chatroom) {
      throw new NotFoundException('Chatroom not found');
    }

    if (!chatroom.isGroup) {
      throw new BadRequestException('Members can only be added to group chatrooms');
    }

    if (chatroom.createdById !== userId) {
      throw new ForbiddenException('Only the chatroom creator can add members');
    }

    const users = await this.prismaService.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true },
    });

    const foundUserIds = new Set(users.map((item) => item.id));
    const missingUserIds = uniqueUserIds.filter((id) => !foundUserIds.has(id));

    if (missingUserIds.length > 0) {
      throw new NotFoundException(
        `Users not found: ${missingUserIds.join(', ')}`,
      );
    }

    const existingMemberships = await this.prismaService.chatroomUser.findMany({
      where: {
        chatroomId,
        userId: { in: uniqueUserIds },
      },
      select: { userId: true },
    });

    const existingMembershipIds = new Set(existingMemberships.map((item) => item.userId));
    const userIdsToAdd = uniqueUserIds.filter(
      (id) => !existingMembershipIds.has(id),
    );

    if (userIdsToAdd.length === 0) {
      return {
        addedUserIds: [],
        chatroom,
      };
    }

    try {
      await this.prismaService.chatroomUser.createMany({
        data: userIdsToAdd.map((memberId) => ({
          chatroomId,
          userId: memberId,
          role: ChatroomRole.MEMBER,
        })),
        skipDuplicates: true,
      });

      const updatedChatroom = await this.prismaService.chatroom.findUnique({
        where: { id: chatroomId },
        include: {
          createdBy: true,
          memberships: {
            include: { user: true },
          },
        },
      });

      if (!updatedChatroom) {
        throw new InternalServerErrorException('Failed to load updated chatroom');
      }

      return {
        addedUserIds: userIdsToAdd,
        chatroom: updatedChatroom,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add users to chatroom');
    }
  }
}
