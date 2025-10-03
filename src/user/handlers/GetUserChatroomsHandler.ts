import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserChatroomsQuery } from "../query/GetUserChatrooms.query";
import { PrismaService } from "src/prisma.service";
import { GetUserChatroomsResponse } from "../types/getUserChatrooms.type";

@QueryHandler(GetUserChatroomsQuery)
export class GetUserChatroomsHandler implements IQueryHandler<GetUserChatroomsQuery> {

    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async execute(query: GetUserChatroomsQuery): Promise<GetUserChatroomsResponse> {
        const { userId } = query;

        const chatrooms = await this.prismaService.chatroom.findMany({
            where: {
                deletedAt: null,
                memberships: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                createdBy: true,
                memberships: {
                    include: {
                        user: true,
                    },
                },
                messages: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        const formattedChatrooms = chatrooms.map((chatroom) => ({
            id: chatroom.id,
            name: chatroom.name ?? undefined,
            isGroup: chatroom.isGroup,
            avatarUrl: chatroom.avatarUrl ?? undefined,
            createdById: chatroom.createdById,
            createdBy: chatroom.createdBy,
            createdAt: chatroom.createdAt,
            updatedAt: chatroom.updatedAt,
            deletedAt: chatroom.deletedAt ?? undefined,
            memberships: chatroom.memberships.map((membership) => ({
                id: membership.id,
                userId: membership.userId,
                chatroomId: membership.chatroomId,
                role: membership.role,
                joinedAt: membership.joinedAt,
                lastReadAt: membership.lastReadAt ?? undefined,
                isMuted: membership.isMuted,
                user: membership.user,
            })),
            messages: chatroom.messages.map((message) => ({
                id: message.id,
                content: message.content ?? undefined,
                imageUrl: message.imageUrl ?? undefined,
                userId: message.userId,
                chatroomId: message.chatroomId,
                isEdited: message.isEdited,
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
                deletedAt: message.deletedAt ?? undefined,
                user: message.user ?? undefined,
            })),
        }));

        return new GetUserChatroomsResponse({
            chatrooms: formattedChatrooms,
        });
    }

}