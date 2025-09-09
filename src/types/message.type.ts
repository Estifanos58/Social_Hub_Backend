import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { UserDto, ChatroomDto } from ".";

@ObjectType()
export class MessageDto {
  @Field()
  id: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  userId: string;

  @Field()
  chatroomId: string;

  @Field()
  isEdited: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;

  @Field(() => ChatroomDto, { nullable: true })
  chatroom?: ChatroomDto;
}
