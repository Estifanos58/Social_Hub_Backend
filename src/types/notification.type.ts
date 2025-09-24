import { Field, ObjectType, GraphQLISODateTime, registerEnumType, Int } from '@nestjs/graphql';
import { UserDto, PostDto, CommentDto, ReactionDto } from '.';

export enum GqlNotificationType {
  LOGIN = 'LOGIN',
  COMMENT_ON_POST = 'COMMENT_ON_POST',
  REPLY_ON_COMMENT = 'REPLY_ON_COMMENT',
  REACTION_ON_POST = 'REACTION_ON_POST',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  POST_DELETED = 'POST_DELETED',
}

registerEnumType(GqlNotificationType, { name: 'NotificationType' });

@ObjectType()
export class NotificationDto {
  @Field()
  id: string;

  @Field(() => GqlNotificationType)
  type: GqlNotificationType;

  @Field()
  recipientId: string;

  @Field(()=> String ,{ nullable: true })
  actorId?: string | null;

  @Field(()=> String,{ nullable: true })
  postId?: string | null;

  @Field(()=> String,{ nullable: true })
  commentId?: string | null;

  @Field(()=> String,{ nullable: true })
  reactionId?: string | null;

  @Field()
  isRead: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  readAt?: Date | null;

  // Related entities for display
  @Field(() => UserDto, { nullable: true })
  actor?: UserDto | null;

  @Field(() => UserDto, { nullable: true })
  recipient?: UserDto | null;

  @Field(() => PostDto, { nullable: true })
  post?: PostDto | null;

  @Field(() => CommentDto, { nullable: true })
  comment?: CommentDto | null;

  @Field(() => ReactionDto, { nullable: true })
  reaction?: ReactionDto | null;
}
