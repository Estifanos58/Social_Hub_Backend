import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { GraphQLAuthGuard } from "src/guard/graphql-auth.guard";
import { CreatePostDto } from "./dto";
import { Request } from "express";
import { CreatePostCommand } from "./commands/createPost.command";

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
}