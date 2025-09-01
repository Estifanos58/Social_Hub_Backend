import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { RegisterDto } from './dto';
import { RegisterCommand } from './commands/register.command';
import { Request, Response } from 'express';
import { RegisterResponse } from './types';
import { User } from 'src/user/user.type';
import { GetUserQuery } from './query/getUser.query';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ){}

    
    @Mutation(() => RegisterResponse)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response}
    ) {
        return this.commandBus.execute(new RegisterCommand(
            registerDto.email,
            registerDto.password,
            registerDto.firstname,
            registerDto.lastname,
            context.res
        ));
    }

    @Query(()=> User)
    async getuser(
        @Context() context: {req: Request}
    ){
        const userId = context.req.user?.sub!;
        return this.queryBus.execute(new GetUserQuery(userId));
    }
    
}
