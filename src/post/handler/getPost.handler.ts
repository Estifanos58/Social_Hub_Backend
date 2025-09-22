import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPostQuery } from "../query/getPost.query";
import { PrismaService } from "src/prisma.service";
import { HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { GetPostType } from "../types/getPost.type";

@QueryHandler(GetPostQuery)
export class GetPostHandler implements IQueryHandler<GetPostQuery> {
    constructor(
        private readonly prismaService: PrismaService
    ){}
    async execute(query: GetPostQuery): Promise<GetPostType> {
        try {
            const {postId, userId} = query;

            const post = await this.prismaService.post.findUnique({
                where: {
                    id: postId
                },
                include: {
                    createdBy: true,
                    comments: { include: { createdBy: true } },
                    images: true,
                    reactions: true,
                    _count: {
                        select: { comments: true, reactions: true }
                    }
                }
            });
            if(!post) throw new NotFoundException("Post not found");

            const userReaction = userId ? post.reactions.find(r => r.createdById === userId) : null;

            const mappedPost: GetPostType = {
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                createdById: post.createdById,
                createdBy: post.createdBy,
                images: post.images,
                comments: post.comments,
                reactions: post.reactions,
                commentsCount: post._count.comments,
                reactionsCount: post._count.reactions,
                userReaction: userReaction ? userReaction.type as string : null
            };
            return mappedPost;
        } catch (error) {
            if(error instanceof HttpException) throw error;
            throw new InternalServerErrorException("Failed to fetch posts");   
        }
    }
}