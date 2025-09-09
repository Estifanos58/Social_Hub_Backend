import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../query/GetUser.query';
import { PrismaService } from 'src/prisma.service';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Post, User } from '@prisma/client';
import { UserProfileDto } from '../types/getUser.type';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(query: GetUserQuery): Promise<any> {
    const { userId, requesterId } = query;

    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          posts: true,
        },
      });

      if (!user) throw new NotFoundException('User not found');

      if (user.id === requesterId) {
        return this.toUserProfile(user, true, this.prismaService);
      }
      if (user.isPrivate) {
        const isFollowing = await this.prismaService.follower.findUnique({
          where: {
            followerId_followingId: {
              followerId: requesterId,
              followingId: userId,
            },
          },
        });

        if (!isFollowing) {
          return this.toUserProfile(user, false, this.prismaService);
        }

        return this.toUserProfile(user, true, this.prismaService);
      }

      return this.toUserProfile(user, true, this.prismaService);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  private async toUserProfile(
    user: User & { posts: Post[] },
    includeSensitive: boolean,
    prismaService: PrismaService,
  ): Promise<UserProfileDto> {
    const followersCount = await prismaService.follower.count({
      where: { followingId: user.id },
    });

    const followingCount = await prismaService.follower.count({
      where: { followerId: user.id },
    });

    return new UserProfileDto({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname || undefined,
        email: user.email,
        bio: user.bio || undefined,
        avatarUrl: user.avatarUrl || undefined,
        verified: user.verified,
        isPrivate: user.isPrivate,
        lastSeenAt: user.lastSeenAt || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        posts: includeSensitive ? user.posts : undefined,
      },
      followersCount,
      followingCount,
    });
  }
}
