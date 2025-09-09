import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { UserDto } from ".";

@ObjectType()
export class CredentialDto {
  @Field()
  id: string;

  @Field({ nullable: true })
  twoFactorEnabled?: boolean;

  @Field({ nullable: true })
  userId?: string;

  @Field(() => UserDto, { nullable: true })
  user?: UserDto;

  @Field({ nullable: true })
  googleId?: string;

  @Field({ nullable: true })
  facebookId?: string;

  @Field({ nullable: true })
  githubId?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
