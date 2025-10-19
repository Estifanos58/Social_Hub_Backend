import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserPresenceDto {
  @Field()
  userId: string;

  @Field()
  isOnline: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  lastSeenAt?: Date | null;
}
