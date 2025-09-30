import { Field, ObjectType } from "@nestjs/graphql";
import { MessageDto, UserDto } from "src/types";

@ObjectType()
export class GetChatUsersDto {
    @Field(() => String)
    chatroomId: string;

    @Field(() => Boolean)
    isGroup: boolean;

    @Field(() => String, { nullable: true })
    groupName?: string;

    @Field(() => MessageDto)
    latestMessage: MessageDto;

    @Field(() => UserDto, { nullable: true })
    otherUser?: UserDto;

    constructor(partial: Partial<GetChatUsersDto>) {
        Object.assign(this, partial);
    }
}

@ObjectType()
export class GetChatUsersResponse {
    @Field(()=> [GetChatUsersDto])
    chatrooms: GetChatUsersDto[];
    constructor(partial: Partial<GetChatUsersResponse>) {
        Object.assign(this, partial);
    }
}