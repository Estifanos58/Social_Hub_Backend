import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { ChatroomUserDto, MessageDto, UserDto } from ".";



@ObjectType()
export class ChatroomDto {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  isGroup: boolean;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  createdById: string;

  @Field(() => UserDto, { nullable: true })
  createdBy?: UserDto;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date;

  @Field(() => [ChatroomUserDto], { nullable: true })
  memberships?: ChatroomUserDto[];

  @Field(() => [MessageDto], { nullable: true })
  messages?: MessageDto[];
}
