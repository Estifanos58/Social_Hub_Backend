import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { UserDto } from ".";

@ObjectType()
export class FollowerDto {
  @Field()
  id: string;

  @Field()
  followerId: string;

  @Field()
  followingId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => UserDto, { nullable: true })
  follower?: UserDto;

  @Field(() => UserDto, { nullable: true })
  following?: UserDto;
}
