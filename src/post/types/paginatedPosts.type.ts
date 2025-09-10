import { Field, Int, ObjectType, PickType } from "@nestjs/graphql";
import { PostDto } from "src/types";

@ObjectType()
export class PaginatedPostsDto {
    @Field(() => [PostFeedDto])
    posts: PostFeedDto[]

    @Field()
    hasMore: boolean;
}


@ObjectType()
export class PostFeedDto extends PickType(PostDto, [
  "id",
  "content",
  "createdAt",
  "updatedAt",
  "createdById",
  "createdBy",
  "images",
] as const) {
  
  @Field(() => Int)
  commentsCount: number;

  @Field(() => Int)
  reactionsCount: number;
}
