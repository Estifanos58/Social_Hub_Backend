import { Field, ObjectType } from "@nestjs/graphql";
import { ChatroomDto } from "src/types";

@ObjectType()
export class GetUserChatroomsResponse {
    @Field(() => [ChatroomDto])
    chatrooms: ChatroomDto[];

    constructor(partial: Partial<GetUserChatroomsResponse>) {
        Object.assign(this, partial);
    }
}
