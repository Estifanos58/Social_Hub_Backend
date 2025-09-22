import { Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { PostDto } from 'src/types';

@ObjectType()
export class GetPostType extends PickType(PostDto, [
  'id',
  'content',
  'createdAt',
  'updatedAt',
  'createdById',
  'createdBy',
  'images',
  'comments',
  'reactions'
] as const) {
  @Field(() => Int)
  commentsCount: number;

  @Field(() => Int)
  reactionsCount: number;

  @Field(() => String, { nullable: true })
  userReaction?: string | null; // Assuming reactions are stored as an array of strings
}
