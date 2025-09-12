import { Field, ObjectType } from "@nestjs/graphql";
import { CommentDto } from "src/types";

@ObjectType()
export class CreateCommentResponse {
    @Field(()=> CommentDto, { nullable: true })
    comment?: CommentDto;
}