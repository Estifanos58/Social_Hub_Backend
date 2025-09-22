import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { LoginDto, RegisterDto } from './dto';
import { RegisterCommand } from './commands/register.command';
import { Request, Response } from 'express';
import { UserResponse } from './types';
import { GetCurrentUserQuery } from './query/getCurrentUser.query';
import { UseGuards } from '@nestjs/common';
import { GraphQLAuthGuard } from './graphql-auth.guard';
import { LoginCommand } from './commands/login.command';
import { VerifiEmailCommand } from './commands/verifyEmail.command';
import { ForgotPasswordCommand } from './commands/forgotPassword.command';
import { ResetPasswordCommand } from './commands/resetPassword.command';
import { UserDto } from 'src/types';


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
    ): Promise<UserResponse> {
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

    // @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> String)
    async forgotPassword(
        @Args('email') email: string,
    ){
        return this.commandBus.execute(new ForgotPasswordCommand(email));
    }

    @UseGuards(GraphQLAuthGuard)
    @Mutation(()=> UserResponse)
    async resetPassword(
        @Args('token') token: string,
        @Args('newPassword') newPassword: string,
        @Context() context: { req: Request, res: Response}
    ){
        const userId = context.req.user?.sub!;
        return this.commandBus.execute(new ResetPasswordCommand(userId, token, newPassword, context.res));
    }

    @UseGuards(GraphQLAuthGuard)
    @Query(()=> UserDto)
    async getme(
        @Context() context: {req: Request}
    ){
        const userId = context.req.user?.sub!;
        return this.queryBus.execute(new GetCurrentUserQuery(userId));
    }


    @Mutation(() => String)
    async logout(
        @Context() context: { res: Response}
    ){
        context.res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true });
        context.res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
        return 'Successfully logged out';
    }
    
}
