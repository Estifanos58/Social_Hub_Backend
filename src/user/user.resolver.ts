import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { UserResponse } from "src/auth/types";
import { GraphQLAuthGuard } from "src/guard/graphql-auth.guard";
import { FollowUserCommand } from "./commands/FollowUserCommand";
import { Request } from "express";
import { UnFollowUserCommand } from "./commands/UnFollowUserCommand";

@Resolver()
export class UserResolver {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> String)
    async followUser(
       @Args('followingId') followingId: string,
       @Context() context: { req: Request }
    ): Promise<UserResponse> {
        return this.commandBus.execute(new FollowUserCommand(
            context.req.user?.sub!,
            followingId
        ));
    }

    @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> String)
    async UnfollowUser(
       @Args('followingId') followingId: string,
       @Context() context: { req: Request }
    ): Promise<UserResponse> {
        return this.commandBus.execute(new UnFollowUserCommand(
            context.req.user?.sub!,
            followingId
        ));
    }

    
}