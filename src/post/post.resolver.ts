import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLAuthGuard } from "src/auth/graphql-auth.guard";
import { CreatePostDto } from "./dto";
import { Request } from "express";
import { CreatePostCommand } from "./commands/createPost.command";
import { DeletePostCommand } from "./commands/deletePost.command";
import { PaginatedPostsDto } from "./types/paginatedPosts.type";
import { GetPostsQuery } from "./query/GetPosts.query";

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

    @Query(()=>PaginatedPostsDto)
    async getPosts(
        @Args('take') take: number,
        @Args('cursor') cursor?: string,
    ): Promise<PaginatedPostsDto> {
        return this.queryBus.execute(new GetPostsQuery(cursor, take))
    }

}