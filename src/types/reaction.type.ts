import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { ReactionType } from '@prisma/client';
import { PostDto, UserDto } from '.';

@ObjectType()
export class ReactionDto {
  @Field()
  id: string;

  @Field(() => ReactionType)
  type: ReactionType;

  @Field()
  postId: string;

  @Field(() => PostDto, { nullable: true })
  post?: PostDto;

  @Field()
  createdById: string;

  @Field(() => UserDto, { nullable: true })
  createdBy?: UserDto;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
