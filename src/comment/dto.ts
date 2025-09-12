import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

@InputType()
export class CreateCommentDto {
    @Field()
    @IsNotEmpty({ message: 'PostId is required' })
    @IsString({ message: 'PostId must be a string' })
    postId: string;

    @Field()
    @IsNotEmpty({ message: 'AuthorId is required' })
    @IsString({ message: 'AuthorId must be a string' })
    content: string;

    @Field(()=> String ,{ nullable: true })
    @IsString({ message: 'ParentId must be a string' })
    @IsOptional()
    parentId?: string | null;
}