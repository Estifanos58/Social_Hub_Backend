import { Field, InputType } from '@nestjs/graphql';
import {
    ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

@InputType()
export class CreatePostDto {
  @Field()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each image URL must be a string' })
  @IsUrl({}, { each: true, message: 'Each image URL must be a valid URL' })
  @ArrayMaxSize(5, { message: 'A post can have at most 5 images' })
  imageUrls?: string[];
}


