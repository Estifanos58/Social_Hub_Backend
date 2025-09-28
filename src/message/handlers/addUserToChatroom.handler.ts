import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChatroomRole } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AddUserToChatroomCommand } from '../commands/AddUserToChatroom.command';

@CommandHandler(AddUserToChatroomCommand)
export class AddUserToChatroomHandler
  implements ICommandHandler<AddUserToChatroomCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: AddUserToChatroomCommand) {
    const { userId, otherUserId, chatroomId } = command;

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

    const otherUser = await this.prismaService.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      throw new NotFoundException('User to add not found');
    }

    const existingMembership = await this.prismaService.chatroomUser.findUnique({
      where: {
        userId_chatroomId: {
          chatroomId,
          userId: otherUserId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this chatroom');
    }

    try {
      await this.prismaService.chatroomUser.create({
        data: {
          chatroomId,
          userId: otherUserId,
          role: ChatroomRole.MEMBER,
        },
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

      return updatedChatroom;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add user to chatroom');
    }
  }
}
