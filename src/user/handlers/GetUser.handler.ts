import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../query/GetUser.query';
import { PrismaService } from 'src/prisma.service';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserProfileDto } from '../types/getUser.type';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserQuery): Promise<UserProfileDto> {
    const { userId, requesterId } = query;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          posts: {
            include: {
              images: { take: 1 }, // grab first image
              comments: true,
              reactions: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) throw new NotFoundException('User not found');

      // privacy logic
      let canView = true;
      if (user.id !== requesterId && user.isPrivate) {
        const isFollowing = await this.prisma.follower.findUnique({
          where: {
            followerId_followingId: {
              followerId: requesterId,
              followingId: userId,
            },
          },
        });
        if (!isFollowing) canView = false;
      }

      if (!canView) {
        return this.buildUserProfile(user, false);
      }

      return this.buildUserProfile(user, true);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  private async buildUserProfile(
    user: any,
    includeSensitive: boolean,
  ): Promise<any> {
    const followersCount = await this.prisma.follower.count({
      where: { followingId: user.id },
    });

    const followingCount = await this.prisma.follower.count({
      where: { followerId: user.id },
    });

    return new UserProfileDto({
      user: {
        id: user.id,
        avatarUrl: user.avatarUrl,
        firstname: user.firstname,
        lastname: user.lastname || '',
        bio: user.bio || '',
        email: user.email,
        isPrivate: user.isPrivate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        verified: user.verified,
        lastSeenAt: includeSensitive ? user.lastSeenAt : null,
      },
      followers: followersCount,
      following: followingCount,
      posts: includeSensitive
        ? user.posts.map((post) => ({
            id: post.id,
            imageUrl: post.images[0]?.url || null,
            likes: post.reactions.length,
            comments: post.comments.length,
          }))
        : [],
    });
  }
}
