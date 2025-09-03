import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field( { nullable: true } )
    id?: string;

    @Field()
    email: string;

    @Field( { nullable: true } )
    avatarUrl?: string;

    @Field( { nullable: true } )
    bio?: string;

    @Field( { nullable: true } )
    firstname?: string;

    @Field( { nullable: true } )
    lastname?: string;

    @Field( { nullable: true } )
    lastSeenAt?: Date;

    @Field( { nullable: true } )
    createdAt?: Date;

    @Field( { nullable: true } )
    updatedAt?: Date;

    @Field( { nullable: true } )
    isActive?: boolean;


}