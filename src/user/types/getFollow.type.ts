import { Field, ObjectType } from "@nestjs/graphql";
import { UserDto } from "src/types";

@ObjectType()
export class GetFollowersDto {
    @Field(()=> [UserDto], { nullable: true })
    users: UserDto[];

    @Field({ nullable: true })
    totalFollowers: number;

    @Field({ nullable: true })
    totalFollowing: number;

    @Field({ nullable: true })
    hasMore?: boolean;

    constructor(partial: Partial<GetFollowersDto>) {
        Object.assign(this, partial);
    }
}