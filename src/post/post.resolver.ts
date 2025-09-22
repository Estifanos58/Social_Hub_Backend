import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLAuthGuard } from "src/auth/graphql-auth.guard";
import { CreatePostDto } from "./dto";
import { Request } from "express";
import { CreatePostCommand } from "./commands/createPost.command";
import { DeletePostCommand } from "./commands/deletePost.command";
import { PaginatedPostsDto } from "./types/paginatedPosts.type";
import { GetPostType } from "./types/getPost.type";
import { GetPostQuery } from "./query/getPost.query";
import { GetPostsQuery } from "./query/getPosts.query"
import { AddReactionCommand } from "./commands/addReaction.command";
import { RemoveReactionCommand } from "./commands/removeReaction.command";

@Resolver()
export class PostResolver {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> String)
    async createPost(
        @Args('createPost') createPost: CreatePostDto,
        @Context() context: { req: Request}
    ): Promise<string> {
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new CreatePostCommand(userId, createPost.content, createPost.imageUrls))
    }

    @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> String)
    async deletePost(
        @Args('postId') postId: string,
        @Context() context: { req: Request}
    ): Promise<string> {
        const userId = context.req.user?.sub!
        return this.commandBus.execute(new DeletePostCommand(postId, userId))
    }

    @UseGuards(GraphQLAuthGuard)
    @Query(()=>PaginatedPostsDto)
    async getPosts(
        @Args('take') take: number,
        @Args('cursor') cursor?: string,
        @Context() context?: { req: Request}
    ): Promise<PaginatedPostsDto> {
        const userId = context?.req?.user?.sub;
        return this.queryBus.execute(new GetPostsQuery(cursor, take, userId))
    }

    @Query(()=> GetPostType)
    async getPost(
        @Args('postId') postId: string
    ): Promise<GetPostType> {
        return this.queryBus.execute(new GetPostQuery(postId))
    }


    @Mutation(()=> Boolean)
    @UseGuards(GraphQLAuthGuard)
    async addReaction(
        @Args('postId') postId: string,
        @Args('type') type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD',
        @Context() context: { req: Request}
    ): Promise<boolean> {
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new AddReactionCommand(userId, postId, type))
    }

    @Mutation(()=> Boolean)
    @UseGuards(GraphQLAuthGuard)
    async removeReaction(
        @Args('postId') postId: string,
        @Context() context: { req: Request}
    ): Promise<boolean> {
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new RemoveReactionCommand(postId, userId));
    }
}