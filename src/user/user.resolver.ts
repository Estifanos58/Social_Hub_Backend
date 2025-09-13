import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserResponse } from "src/auth/types";
import { GraphQLAuthGuard } from "src/auth/graphql-auth.guard";
import { FollowUserCommand } from "./commands/FollowUserCommand";
import { Request } from "express";
import { UnFollowUserCommand } from "./commands/UnFollowUserCommand";
import { GetUserQuery } from "./query/GetUser.query";
import { UserProfileDto } from "./types/getUser.type";
import { UpdateUserDto } from "./dto";
import { UpdateUserCommand } from "./commands/UpdateUserCommand";
import { UserDto } from "src/types";

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


    @UseGuards(GraphQLAuthGuard)
    @Query(()=> UserProfileDto)
    async GetUser(
        @Args('userId') userId: string,
        @Context() context: { req: Request }   
    )
    : Promise<UserProfileDto> {
        return this.queryBus.execute(new GetUserQuery(
            userId,
            context.req.user?.sub!
        ));
    }
    
    @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> UserDto)
    async UpdateUser(
        @Args('updateUser') updateUserDto: UpdateUserDto,
        @Context() context: { req: Request }   
    )
    : Promise<UserDto> {
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new UpdateUserCommand(
            userId,
            updateUserDto.firstname,
            updateUserDto.lastname,
            updateUserDto.bio,
            updateUserDto.avatarUrl,
            updateUserDto.isPrivate,
            updateUserDto.twoFactorEnabled,
        ));
    }
}