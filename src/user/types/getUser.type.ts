import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/types';

@ObjectType()
export class UserProfileDto {
  @Field()
  user: UserDto

  @Field({ nullable: true })
  followers?: number;

  @Field({ nullable: true })
  following?: number;

  @Field(() => [Post],{ nullable: true })
  posts?: Post[];

  constructor(partial: Partial<UserProfileDto>) {
    Object.assign(this, partial);
  }
}

@ObjectType()
class Post {
  @Field()
  id: string;
  @Field()
  imageUrl: string;
  @Field()
  likes: number;
  @Field()
  comments: number;
}
