import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { ChatroomRole } from '@prisma/client';
import { ChatroomDto, UserDto } from '.';


@ObjectType()
export class ChatroomUserDto {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  chatroomId: string;

  @Field(() => ChatroomRole)
  role: ChatroomRole;

  @Field(() => GraphQLISODateTime)
  joinedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastReadAt?: Date;

  @Field()
  isMuted: boolean;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;

  @Field(() => ChatroomDto, { nullable: true })
  chatroom?: ChatroomDto;
}
