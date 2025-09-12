import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { CreateCommentDto } from "./dto";
import { CreateCommentCommand } from "./command/createComment.command";
import { Request } from "express";
import { CreateCommentResponse } from "./types/createComment.type";

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
}