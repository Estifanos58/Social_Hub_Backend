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
  post?: PostDto | null;

  @Field()
  createdById: string;

  @Field(() => UserDto, { nullable: true })
  createdBy?: UserDto | null;

  @Field(() => String, { nullable: true })
  parentId?: string | null;

  @Field(() => CommentDto, { nullable: true })
  parent?: CommentDto | null;

  @Field(() => [CommentDto], { nullable: true })
  replies?: CommentDto[] | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt?: Date | null;
}
