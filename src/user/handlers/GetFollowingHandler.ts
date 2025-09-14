import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { GetFollowingQuery } from "../query/GetFollowing.query";
import { GetFollowersDto } from "../types/getFollow.type";

@QueryHandler(GetFollowingQuery)
export class GetFollowingHandler implements IQueryHandler<GetFollowingQuery> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetFollowingQuery): Promise<GetFollowersDto> {
    const { userId, skip, take } = query;

    try {
      const [totalFollowers, totalFollowing, users] = await Promise.all([
        this.prismaService.follower.count({
          where: { followingId: userId }, 
        }),
        this.prismaService.follower.count({
          where: { followerId: userId },
        }),
        this.prismaService.follower.findMany({
          where: { followerId: userId }, 
          skip,
          take,
          include: {
            following: true, 
          },
        }),
      ]);

      return new GetFollowersDto({ users: users.map(f => f.following), totalFollowers, totalFollowing });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Server Error Happened");
    }
  }
}
