import { Module } from "@nestjs/common";
import { PostResolver } from "./post.resolver";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "src/prisma.service";
import { CreatePostHandler } from "./handler/createPost.handler";

const CommandHandlers = [CreatePostHandler]
const QueryHandler = []
@Module({
    imports: [CqrsModule, ConfigModule],
    providers: [PostResolver, PrismaService,  ...CommandHandlers, ...QueryHandler],
})

export class PostModule {}