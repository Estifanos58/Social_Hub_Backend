import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsEmail, MinLength, IsString } from "class-validator";

@InputType()
export class RegisterDto {
    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: "Email must be Valid"})
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @Field()
    @IsNotEmpty({ message: 'FirstName is required' })
    @IsString({ message: 'FirstName must be a string' })
    firstname: string;

    @Field()
    @IsNotEmpty({ message: 'LastName is required' })
    @IsString({ message: 'LastName must be a string' })
    lastname: string;
}