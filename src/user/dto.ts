import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { UserDto } from "src/types";

@InputType()
export class UpdateUserDto {
    
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'FirstName must be a string' })
  firstname?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'LastName must be a string' })
  lastname?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isPrivate must be a boolean' })
  isPrivate?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'twoFactorEnabled must be a boolean' })
  twoFactorEnabled?: boolean;
}

@InputType()
export class GetUsersToFollow {
  @Field(()=> Int, { nullable: true })
  @IsOptional()
  limit?:  number;

  @Field(()=> Int, { nullable: true })
  @IsOptional()
  offset?: number;
}

@InputType()
export class GetFollowersInput {
  @Field(()=> Int, { nullable: true })
  @IsOptional()
  take?: number;

  @Field(()=> Int, { nullable: true })
  @IsOptional()
  skip?: number;
}

@InputType()
export class SearchUsersInput {
  @Field()
  @IsString({ message: 'searchTerm must be a string' })
  searchTerm: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  offset?: number;
}


@ObjectType()
export class SearchUsersResultDto {
    @Field(() => [UserDto])
    users: UserDto[];

    @Field()
    hasMore: boolean;
}