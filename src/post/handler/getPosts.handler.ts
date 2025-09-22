import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/prisma.service";
import { HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GetPostsQuery } from "../query/getPosts.query";
import { PaginatedPostsDto} from "../types/paginatedPosts.type";

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetPostsQuery): Promise<PaginatedPostsDto> {
    const { cursor, take, userId } = query;
    console.log(`Executing GetPostsHandler with userId: ${userId}`);

    try {
      const posts = await this.prisma.post.findMany({
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: true,
          images: true,
          reactions: true,
          _count: {
            select: { comments: true, reactions: true },
          },
        },
      });

      if(!posts) throw new NotFoundException("No posts found");

      const hasMore = posts.length > take;

      console.log(`Fetched POSTS ${posts}`);

      const mappedPosts = (hasMore ? posts.slice(0, -1) : posts).map(
        (post) => ({
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          createdById: post.createdById,
          createdBy: post.createdBy,
          images: post.images,
          commentsCount: post._count.comments,
          reactionsCount: post._count.reactions,
          userReaction: userId ? post.reactions.find(r => r.createdById === userId)?.type || null : null,
        })
      );

      console.log(`Fetched MAPPEDPOSTS ${mappedPosts}`);

      return {
        posts: mappedPosts,
        hasMore
      }
    } catch (error) {
      if(error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Failed to fetch posts");
    }
  }
}
