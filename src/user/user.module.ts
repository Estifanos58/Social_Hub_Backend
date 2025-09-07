import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { CqrsModule } from "@nestjs/cqrs"
import { PrismaService } from "src/prisma.service"
import { UserResolver } from "./user.resolver"
import { FollowUserHandler, UnFollowUserHandler } from "./handlers"


const CommandHandlers = [FollowUserHandler, UnFollowUserHandler]
const QueryHandlers = []

@Module({
    imports: [CqrsModule, ConfigModule],
    providers: [UserResolver, PrismaService, ...CommandHandlers, ...QueryHandlers],
})

export class UserModule {}