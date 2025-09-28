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
import { GetFollowersInput, GetUsersToFollow, SearchUsersInput, SearchUsersResultDto, UpdateUserDto } from "./dto";
import { UpdateUserCommand } from "./commands/UpdateUserCommand";
import { UserDto } from "src/types";
import { GetUsersToFollowDto } from "./types/getUsersToFollow.type";
import { GetUsersToFollowQuery } from "./query/GetUsersToFollow.query";
import { GetFollowersDto } from "./types/getFollow.type";
import { GetFollowersQuery } from "./query/GetFollowers.query";
import { GetFollowingQuery } from "./query/GetFollowing.query";
import { SearchUsersQuery } from "./query/SearchUsers.query";

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
    @Query(()=> GetUsersToFollowDto)
    async GetUsersToFollow(
        @Args('getUsersToFollow') getUsersToFollow: GetUsersToFollow,
        @Context() context: { req: Request }
    ): Promise<GetUsersToFollowDto> {
        const userId = context.req.user?.sub!;
        return this.queryBus.execute(new GetUsersToFollowQuery(userId, getUsersToFollow.limit, getUsersToFollow.offset));
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

    @UseGuards(GraphQLAuthGuard)
    @Query(()=> GetFollowersDto)
    async GetFollowers(
        @Args('getFollowers') getFollowers: GetFollowersInput,
        @Context() context: { req: Request },
    ): Promise<GetFollowersDto> {
        const userId = context.req.user?.sub!;
        return this.queryBus.execute(new GetFollowersQuery(userId, getFollowers.take, getFollowers.skip));
    }

    @UseGuards(GraphQLAuthGuard)
    @Query(()=> GetFollowersDto)
    async GetFollowing(
        @Args('getFollowing') getFollowing: GetFollowersInput,
        @Context() context: { req: Request },
    ): Promise<GetFollowersDto> {
        const userId = context.req.user?.sub!;
        return this.queryBus.execute(new GetFollowingQuery(userId, getFollowing.take, getFollowing.skip));
    }


    @UseGuards(GraphQLAuthGuard)
    @Query(() => SearchUsersResultDto)
    async SearchUsers(
        @Args('searchUsersInput') searchUsersInput: SearchUsersInput,
        @Context() context: { req: Request },
    ): Promise<SearchUsersResultDto> {
        const userId = context.req.user?.sub!;
        const { searchTerm, limit, offset } = searchUsersInput;
        return this.queryBus.execute(new SearchUsersQuery(userId, searchTerm, limit ?? 10, offset ?? 0));
    }
}