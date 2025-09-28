import { BadRequestException, HttpException, InternalServerErrorException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/prisma.service";
import { SearchUsersQuery } from "../query/SearchUsers.query";
import { SearchUsersResultDto } from "../dto";

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<SearchUsersQuery> {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async execute(query: SearchUsersQuery): Promise<SearchUsersResultDto> {
        const { userId, searchTerm, limit, offset } = query;

        const trimmedTerm = searchTerm?.trim();

        if (!trimmedTerm) {
            throw new BadRequestException("searchTerm must not be empty.");
        }

        const effectiveLimit = limit && limit > 0 ? Math.min(limit, 50) : 10;
        const effectiveOffset = offset && offset >= 0 ? offset : 0;

        try {
            const users = await this.prismaService.user.findMany({
                where: {
                    id: { not: userId },
                    OR: [
                        { firstname: { contains: trimmedTerm, mode: "insensitive" } },
                        { lastname: { contains: trimmedTerm, mode: "insensitive" } },
                    ],
                },
                take: effectiveLimit + 1,
                skip: effectiveOffset,
                orderBy: {
                    createdAt: "desc",
                },
            });

            const hasMore = users.length > effectiveLimit;

            return {
                users: hasMore ? users.slice(0, effectiveLimit) : users,
                hasMore,
            };
        } catch (error) {
            console.error(error);
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException("An error occurred while searching for users.");
        }
    }
}