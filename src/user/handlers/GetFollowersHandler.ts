import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetFollowersQuery } from "../query/GetFollowers.query";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { GetFollowersDto } from "../types/getFollow.type";

@QueryHandler(GetFollowersQuery)
export class GetFollowersHandler implements IQueryHandler<GetFollowersQuery> {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(query: GetFollowersQuery): Promise<GetFollowersDto> {
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
          where: { followingId: userId },
          skip,
          take,
          include: {
            follower: true, 
          },
        }),
      ]);

      return new GetFollowersDto({
        users: users.map((f) => (f.follower)),
        totalFollowers,
        totalFollowing,
      });
      
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Server Error Happened");
    }
  }
}
