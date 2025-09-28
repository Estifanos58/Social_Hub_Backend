import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageCommand } from '../commands/CreateMessage.command';

@CommandHandler(CreateMessageCommand)
export class CreateMessageHandler
  implements ICommandHandler<CreateMessageCommand>
{
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: CreateMessageCommand) {
    const { userId, chatroomId, content, imageUrl } = command;

    if ((!content || !content.trim()) && !imageUrl) {
      throw new BadRequestException('Message must include content or an image');
    }

    const chatroom = await this.prismaService.chatroom.findUnique({
      where: { id: chatroomId },
      include: {
        memberships: true,
      },
    });

    if (!chatroom || chatroom.deletedAt) {
      throw new NotFoundException('Chatroom not found');
    }

    const isMember = chatroom.memberships.some(
      (membership) => membership.userId === userId,
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this chatroom');
    }

    try {
      const message = await this.prismaService.message.create({
        data: {
          chatroomId,
          userId,
          content: content?.trim() ?? null,
          imageUrl: imageUrl ?? null,
        },
        include: {
          user: true,
          chatroom: {
            include: {
              createdBy: true,
              memberships: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      return message;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create message');
    }
  }
}
