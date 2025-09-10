import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";

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
