import { Field, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { PostDto, UserDto} from '.'


@ObjectType()
export class CommentDto {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field()
  postId: string;

  @Field(() => PostDto, { nullable: true })
  post?: PostDto;

  @Field()
  createdById: string;

  @Field(() => UserDto, { nullable: true })
  createdBy?: UserDto;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => CommentDto, { nullable: true })
  parent?: CommentDto;

  @Field(() => [CommentDto], { nullable: true })
  replies?: CommentDto[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date;
}
