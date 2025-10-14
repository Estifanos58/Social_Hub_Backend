import { Field, ObjectType } from "@nestjs/graphql";
import { UserDto } from "src/types";

@ObjectType()
export class UserResponse {
    @Field(() => UserDto, { nullable: true })
    user?: UserDto;

    @Field(() => String, { nullable: true })
    accessToken?: string;

    @Field(() => String, { nullable: true })
    refreshToken?: string;
}


