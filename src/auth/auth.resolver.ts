import { CommandBus } from '@nestjs/cqrs';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { RegisterDto } from './dto';
import { RegisterCommand } from './commands/register.command';
import { Response } from 'express';
import { RegisterResponse } from './types';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly commandBus: CommandBus
    ){}

    @Query(() => String)
  sayHello(): string {
    return 'Hello GraphQL!';
  }

    @Mutation(() => RegisterResponse)
    async register(
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response}
    ) {
        return this.commandBus.execute(new RegisterCommand(
            registerDto.email,
            registerDto.password,
            registerDto.fullname,
            context.res
        ));
    }
}
