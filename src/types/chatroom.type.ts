import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
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

@ObjectType()
export class ChatroomMemberDetailDto {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => String, { nullable: true })
  firstname?: string | null;

  @Field(() => String, { nullable: true })
  lastname?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field()
  isOwner: boolean;
}

@ObjectType()
export class ChatroomDirectUserDto {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  firstname?: string | null;

  @Field(() => String, { nullable: true })
  lastname?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => String, { nullable: true })
  bio?: string | null;

  @Field()
  email: string;

  @Field(() => Int)
  totalFollowers: number;

  @Field(() => Int)
  totalFollowing: number;
}

@ObjectType()
export class ChatroomDetailDto {
  @Field()
  id: string;

  @Field()
  isGroup: boolean;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => Int)
  totalMessages: number;

  @Field(() => Int)
  totalPhotos: number;

  @Field(() => Int, { nullable: true })
  totalMembers?: number | null;

  @Field(() => [ChatroomMemberDetailDto], { nullable: true })
  members?: ChatroomMemberDetailDto[] | null;

  @Field(() => ChatroomDirectUserDto, { nullable: true })
  directUser?: ChatroomDirectUserDto | null;
}
