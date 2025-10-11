import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma.service';
import { ChatroomDetailDto, ChatroomMemberDetailDto, ChatroomDirectUserDto } from 'src/types';
import { GetChatroomDetailQuery } from '../query/GetChatroomDetail.query';

@QueryHandler(GetChatroomDetailQuery)
export class GetChatroomDetailHandler implements IQueryHandler<GetChatroomDetailQuery> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetChatroomDetailQuery): Promise<ChatroomDetailDto> {
    const { chatroomId, userId, otherUserId } = query;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!chatroomId && !otherUserId) {
      throw new BadRequestException('chatroomId or otherUserId is required');
    }

    try {
      if (!chatroomId && otherUserId) {
        const directUser = await this.prismaService.user.findUnique({
          where: { id: otherUserId },
        });

        if (!directUser) {
          throw new NotFoundException('User not found');
        }

        const [totalFollowers, totalFollowing] = await Promise.all([
          this.prismaService.follower.count({ where: { followingId: directUser.id } }),
          this.prismaService.follower.count({ where: { followerId: directUser.id } }),
        ]);

        const detail: ChatroomDetailDto = {
          id: directUser.id,
          isGroup: false,
          name: directUser.firstname ?? 'Direct chat',
          avatarUrl: directUser.avatarUrl ?? null,
          totalMessages: 0,
          totalPhotos: 0,
          totalMembers: null,
          members: null,
          directUser: {
            id: directUser.id,
            firstname: directUser.firstname ?? null,
            lastname: directUser.lastname ?? null,
            avatarUrl: directUser.avatarUrl ?? null,
            bio: directUser.bio ?? null,
            email: directUser.email,
            totalFollowers,
            totalFollowing,
          },
        };

        return detail;
      }

      if (!chatroomId) {
        throw new BadRequestException('chatroomId is required');
      }

      const chatroom = await this.prismaService.chatroom.findFirst({
        where: {
          id: chatroomId,
          deletedAt: null,
          memberships: {
            some: { userId },
          },
        },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
          createdBy: true,
        },
      });

      if (!chatroom) {
        throw new NotFoundException('Chatroom not found');
      }

      const [totalMessages, totalPhotos] = await Promise.all([
        this.prismaService.message.count({
          where: {
            chatroomId,
            deletedAt: null,
          },
        }),
        this.prismaService.message.count({
          where: {
            chatroomId,
            deletedAt: null,
            imageUrl: {
              not: null,
            },
          },
        }),
      ]);

      const detail: ChatroomDetailDto = {
        id: chatroom.id,
        isGroup: chatroom.isGroup,
        name: chatroom.name ?? null,
        avatarUrl: chatroom.avatarUrl ?? null,
        totalMessages,
        totalPhotos,
        totalMembers: null,
        members: null,
        directUser: null,
      };

      if (chatroom.isGroup) {
        const members: ChatroomMemberDetailDto[] = chatroom.memberships.map((membership) => ({
          id: membership.id,
          userId: membership.userId,
          firstname: membership.user?.firstname ?? null,
          lastname: membership.user?.lastname ?? null,
          avatarUrl: membership.user?.avatarUrl ?? null,
          isOwner: membership.userId === chatroom.createdById,
        }));

        detail.totalMembers = members.length;
        detail.members = members;
      } else {
        const otherMembership = chatroom.memberships.find((membership) => membership.userId !== userId);

        if (otherMembership?.user) {
          const [totalFollowers, totalFollowing] = await Promise.all([
            this.prismaService.follower.count({ where: { followingId: otherMembership.user.id } }),
            this.prismaService.follower.count({ where: { followerId: otherMembership.user.id } }),
          ]);

          const directUser: ChatroomDirectUserDto = {
            id: otherMembership.user.id,
            firstname: otherMembership.user.firstname,
            lastname: otherMembership.user.lastname ?? null,
            avatarUrl: otherMembership.user.avatarUrl ?? null,
            bio: otherMembership.user.bio ?? null,
            email: otherMembership.user.email,
            totalFollowers,
            totalFollowing,
          };

          detail.directUser = directUser;
          detail.name = directUser.firstname ?? chatroom.name ?? null;
          detail.avatarUrl = directUser.avatarUrl ?? detail.avatarUrl;
        }
      }

      return detail;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to load chatroom detail');
    }
  }
}
