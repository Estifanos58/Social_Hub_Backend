import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUsersToFollowQuery } from "../query/GetUsersToFollow.query";
import { PrismaService } from "src/prisma.service";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { GetUsersToFollowDto } from "../types/getUsersToFollow.type";

@QueryHandler(GetUsersToFollowQuery)
export class GetUsersToFollowHandler implements IQueryHandler<GetUsersToFollowQuery> {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async execute(query: GetUsersToFollowQuery): Promise<GetUsersToFollowDto> {
        const { userId, limit, offset } = query;

        try {
            // Fetch one extra user to check if there are more
            const users = await this.prismaService.user.findMany({
                where: {
                    id: { not: userId },
                    followers: {
                        none: {
                            followingId: userId
                        }
                    }
                },
                take: limit + 1,
                skip: offset,
                orderBy: {
                    createdAt: "desc"
                }
            });

            if(!users || users.length === 0) {
                return {
                    users: [],
                    hasMore: false
                };
            }

            const hasMore = users.length > limit;

            return {
                users: hasMore ? users.slice(0, limit) : users,
                hasMore
            };

        } catch (error) {
            console.error(error);
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException("An error occurred while fetching users to follow.");
        }
    }
}
