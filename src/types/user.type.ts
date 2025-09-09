import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { PostDto, CommentDto, ReactionDto , MessageDto, ChatroomUserDto, ChatroomDto, FollowerDto } from '.';

@ObjectType()
export class UserDto {
  @Field()
  id: string;

  @Field()
  firstname: string;

  @Field({ nullable: true })
  lastname?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  email: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastSeenAt?: Date;

  @Field()
  verified: boolean;

  @Field()
  isPrivate: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations
  @Field(() => [PostDto], { nullable: true })
  posts?: PostDto[];

  @Field(() => [CommentDto], { nullable: true })
  comments?: CommentDto[];

  @Field(() => [ReactionDto], { nullable: true })
  reactions?: ReactionDto[];

  @Field(() => [MessageDto], { nullable: true })
  messages?: MessageDto[];

  @Field(() => [ChatroomUserDto], { nullable: true })
  memberships?: ChatroomUserDto[];

  @Field(() => [ChatroomDto], { nullable: true })
  chatroomsCreated?: ChatroomDto[];

  @Field(() => [FollowerDto], { nullable: true })
  followers?: FollowerDto[];

  @Field(() => [FollowerDto], { nullable: true })
  following?: FollowerDto[];
}
