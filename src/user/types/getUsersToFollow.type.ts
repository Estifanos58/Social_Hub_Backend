import { Field, ObjectType } from "@nestjs/graphql";
import { UserDto } from "src/types";

@ObjectType()
export class GetUsersToFollowDto {
    @Field(()=> [UserDto])
    users: UserDto[];

    @Field()
    hasMore: boolean;
}