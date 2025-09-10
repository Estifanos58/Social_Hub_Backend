import { Field, ObjectType } from "@nestjs/graphql";
import { PostDto } from "./post.type";

@ObjectType()
export class PostImageDto {
    @Field()
    id: string;

    @Field()
    url: string;

    @Field()
    postId: string;
}