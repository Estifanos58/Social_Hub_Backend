import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/user/user.type";

@ObjectType()
export class UserResponse {
    @Field(() => User, { nullable: true })
    user?: User;
}


