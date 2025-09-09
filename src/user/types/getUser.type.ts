import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/types';

@ObjectType()
export class UserProfileDto {
  @Field()
  user: UserDto

  @Field({ nullable: true })
  followersCount?: number;

  @Field({ nullable: true })
  followingCount?: number;

  constructor(partial: Partial<UserProfileDto>) {
    Object.assign(this, partial);
  }
}
