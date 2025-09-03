import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { LoginDto, RegisterDto } from './dto';
import { RegisterCommand } from './commands/register.command';
import { Request, Response } from 'express';
import { UserResponse } from './types';
import { User } from 'src/user/user.type';
import { GetUserQuery } from './query/getUser.query';
import { UseGuards } from '@nestjs/common';
import { GraphQLAuthGuard } from './graphql-auth.guard';
import { LoginCommand } from './commands/login.command';
import { VerifiEmailCommand } from './commands/verifyEmail.command';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ){}

    
    @Mutation(() => UserResponse)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response}
    ) {
        // console.log("Registering user with email:", registerDto.email, "and name:", registerDto.firstname, registerDto.lastname);
        return this.commandBus.execute(new RegisterCommand(
            registerDto.email,
            registerDto.password,
            registerDto.firstname,
            registerDto.lastname,
            context.res
        ));
    }

    @UseGuards(GraphQLAuthGuard)
    @Mutation(() => UserResponse)
    async verifyEmail(
        @Args('token') token: string,
        @Context() context: { req: Request }
    ): Promise<User> {
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new VerifiEmailCommand(token, userId));
    }

    @Mutation(() => UserResponse)
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: { res: Response}
    ){
        // console.log("Logging in user with email:", loginDto.email, "and password:", loginDto.password);
        return this.commandBus.execute(new LoginCommand(
            loginDto.email,
            loginDto.password,
            context.res
        ));
    }

    @UseGuards(GraphQLAuthGuard)
    @Query(()=> User)
    async getuser(
        @Context() context: {req: Request}
    ){
        const userId = context.req.user?.sub!;
        return this.queryBus.execute(new GetUserQuery(userId));
    }
    
}
