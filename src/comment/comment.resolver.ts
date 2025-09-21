import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Query, Resolver, Int } from "@nestjs/graphql";
import { CreateCommentDto } from "./dto";
import { CreateCommentCommand } from "./command/createComment.command";
import { Request } from "express";
import { CreateCommentResponse } from "./types/createComment.type";
import { GetPostCommentsQuery } from './query/getPostComments.query';
import { GetCommentRepliesQuery } from './query/getCommentReplies.query';
import { PostCommentsConnectionDto, CommentRepliesConnectionDto } from './types/pagination.types';

@Resolver()
export class CommentResolver {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Mutation(() => CreateCommentResponse)
    async createComment(
        @Args('createCommentInput') createCommentDto: CreateCommentDto,
        @Context() context: { req: Request }
    ) {
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new CreateCommentCommand(
            createCommentDto.postId,
            userId,
            createCommentDto.content,
            createCommentDto.parentId || null,
        ));
    }

    // Fetch paginated top-level comments (with limited nested replies)
    @Query(() => PostCommentsConnectionDto)
    async postComments(
        @Args('postId') postId: string,
        @Args('first', { type: () => Int, nullable: true }) first?: number,
        @Args('after', { nullable: true }) after?: string,
        @Args('directRepliesLimit', { type: () => Int, nullable: true }) directRepliesLimit?: number,
        @Args('secondLevelLimit', { type: () => Int, nullable: true }) secondLevelLimit?: number,
    ) {
        return this.queryBus.execute(new GetPostCommentsQuery(
            postId,
            first ?? 5,
            after,
            directRepliesLimit ?? 5,
            secondLevelLimit ?? 5,
        ));
    }

    // Fetch paginated direct replies for a specific comment (with optional grandchildren)
    @Query(() => CommentRepliesConnectionDto)
    async commentReplies(
        @Args('commentId') commentId: string,
        @Args('first', { type: () => Int, nullable: true }) first?: number,
        @Args('after', { nullable: true }) after?: string,
        @Args('includeChildren', { type: () => Boolean, nullable: true }) includeChildren?: boolean,
        @Args('secondLevelLimit', { type: () => Int, nullable: true }) secondLevelLimit?: number,
    ) {
        return this.queryBus.execute(new GetCommentRepliesQuery(
            commentId,
            first ?? 5,
            after,
            includeChildren ?? true,
            secondLevelLimit ?? 5,
        ));
    }
}