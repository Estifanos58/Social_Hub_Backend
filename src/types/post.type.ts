import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { UserDto, CommentDto, ReactionDto  } from '.';

@ObjectType()
export class PostDto {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  imageUrl?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date | null;

  @Field()
  createdById: string;

  @Field(() => UserDto, { nullable: true })
  createdBy?: UserDto;

  @Field(() => [CommentDto], { nullable: true })
  comments?: CommentDto[];

  @Field(() => [ReactionDto], { nullable: true })
  reactions?: ReactionDto[];
}
