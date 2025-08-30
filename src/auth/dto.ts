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
    @IsNotEmpty({ message: 'Fullname is required' })
    @IsString({ message: 'Fullname must be a string' })
    fullname: string;
}