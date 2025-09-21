import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CommentDto } from 'src/types/comment.type';

@ObjectType()
export class PageInfoDto {
  @Field({ nullable: true })
  endCursor?: string | null;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@ObjectType()
export class CommentEdgeDto {
  @Field(() => CommentDto)
  node: CommentDto;

  @Field()
  cursor: string; // use comment id as opaque cursor for now
}

@ObjectType()
export class PostCommentsConnectionDto {
  @Field(() => [CommentEdgeDto])
  edges: CommentEdgeDto[];

  @Field(() => PageInfoDto)
  pageInfo: PageInfoDto;

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class CommentRepliesConnectionDto {
  @Field(() => [CommentEdgeDto])
  edges: CommentEdgeDto[];

  @Field(() => PageInfoDto)
  pageInfo: PageInfoDto;

  @Field(() => Int)
  totalCount: number;
}
