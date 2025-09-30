import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetChatUsersQuery } from "../query/GetChatUsers.query";
import { PrismaService } from "src/prisma.service";
import { GetChatUsersResponse } from "../types/getChatUsers.type";

@QueryHandler(GetChatUsersQuery)
export class GetChatUsersHandler implements IQueryHandler<GetChatUsersQuery> {

    constructor(
        private readonly prismaService: PrismaService
    ){}

    async execute(query: GetChatUsersQuery): Promise<GetChatUsersResponse> {
        const { userId } = query;

        try {
            // Get all chatrooms the user is a member of
            const memberships = await this.prismaService.chatroomUser.findMany({
                where: { userId },
                include: {
                    chatroom: {
                        include: {
                            memberships: {
                                include: { user: true }
                            },
                            messages: {
                                where: { deletedAt: null },
                                orderBy: { createdAt: 'desc' },
                                take: 1
                            }
                        }
                    }
                }
            });

            // Format response
            const chatrooms = memberships.map(membership => {
                const chatroom = membership.chatroom;
                const latestMessage = chatroom.messages[0] || null;

                let chatroomInfo: any = {
                    chatroomId: chatroom.id,
                    isGroup: chatroom.isGroup,
                    latestMessage,
                };

                if (chatroom.isGroup) {
                    chatroomInfo.groupName = chatroom.name;
                } else {
                    // For DMs, find the other user
                    const otherUser = chatroom.memberships
                        .map(m => m.user)
                        .find(u => u.id !== userId);
                    chatroomInfo.otherUser = otherUser
                        ? {
                            id: otherUser.id,
                            firstname: otherUser.firstname,
                            lastname: otherUser.lastname,
                            avatarUrl: otherUser.avatarUrl,
                        }
                        : null;
                }

                return chatroomInfo;
            });

            return new GetChatUsersResponse({ chatrooms });
        } catch (error) {
            // You may want to log error or throw a custom exception
            throw error;
        }
    }
}