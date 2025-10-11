import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma.service";
import { ChatroomResolver } from "./chatroom.resolver";
import { AddUserToChatroomHandler, CreateChatroomHandler, GetChatroomDetailHandler } from "./handlers";

const CommandHandlers = [CreateChatroomHandler, AddUserToChatroomHandler];
const QueryHandlers = [GetChatroomDetailHandler];
@Module({
    imports: [CqrsModule, ConfigModule],
    providers: [ChatroomResolver, PrismaService, JwtService, ...CommandHandlers, ...QueryHandlers],
    exports: [CreateChatroomHandler]
})
export class ChatroomModule {}