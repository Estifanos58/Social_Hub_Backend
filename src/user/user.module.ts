import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { CqrsModule } from "@nestjs/cqrs"
import { PrismaService } from "src/prisma.service"
import { UserResolver } from "./user.resolver"
import { FollowUserHandler, GetFollowersHandler, GetFollowingHandler, GetUserHandler, GetUsersToFollowHandler, UnFollowUserHandler, UpdateUserHandler } from "./handlers"
import { JwtService } from "@nestjs/jwt"


const CommandHandlers = [FollowUserHandler, UnFollowUserHandler, UpdateUserHandler]
const QueryHandlers = [GetUserHandler, GetUsersToFollowHandler, GetFollowersHandler, GetFollowingHandler]

@Module({
    imports: [CqrsModule, ConfigModule],
    providers: [UserResolver,JwtService, PrismaService, ...CommandHandlers, ...QueryHandlers],
})

export class UserModule {}