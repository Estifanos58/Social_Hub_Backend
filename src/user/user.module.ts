import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { CqrsModule } from "@nestjs/cqrs"
import { PrismaService } from "src/prisma.service"
import { UserResolver } from "./user.resolver"
import { FollowUserHandler, GetChatUsersHandler, GetFollowersHandler, GetFollowingHandler, GetUserChatroomsHandler, GetUserHandler, GetUsersToFollowHandler, SearchUsersHandler, UnFollowUserHandler, UpdateUserHandler } from "./handlers"
import { JwtService } from "@nestjs/jwt"
import { NotificationModule } from "src/notification/notification.module"
import { NewFollowerEventHandler } from "./event"


const CommandHandlers = [FollowUserHandler, UnFollowUserHandler, UpdateUserHandler]
const EventHandlers = [NewFollowerEventHandler]
const QueryHandlers = [GetUserHandler, GetUsersToFollowHandler, GetFollowersHandler, GetFollowingHandler, SearchUsersHandler, GetChatUsersHandler, GetUserChatroomsHandler]

@Module({
    imports: [CqrsModule, ConfigModule, NotificationModule],
    providers: [UserResolver,JwtService, PrismaService, ...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})

export class UserModule {}