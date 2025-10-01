import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetMessagesQuery } from "../query/GetMessages.query";
import {
    BadRequestException,
    HttpException,
    InternalServerErrorException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

type MessageWithRelations = Prisma.MessageGetPayload<{
    include: {
        user: true;
        chatroom: {
            include: {
                createdBy: true;
                memberships: {
                    include: {
                        user: true;
                    };
                };
            };
        };
    };
}>;

@QueryHandler(GetMessagesQuery)
export class GetMessagesHandler implements IQueryHandler<GetMessagesQuery> {
    constructor(private readonly prismaService: PrismaService) {}

    async execute(query: GetMessagesQuery): Promise<MessageWithRelations[]> {
    const { userId, otherUserId, limit, offset } = query;
        const safeLimit = Math.min(Math.max(limit ?? 20, 1), 100);
        const safeOffset = Math.max(offset ?? 0, 0);

        if (!userId) {
            throw new BadRequestException('userId is required');
        }

        try {
            const resolvedChatroomId = await this.resolveChatroomId(
                userId,
                otherUserId,
            );

            if (!resolvedChatroomId) {
                return [];
            }

            const messages = await this.prismaService.message.findMany({
                where: {
                    chatroomId: resolvedChatroomId,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip: safeOffset,
                take: safeLimit,
                include: {
                    user: true,
                    chatroom: {
                        include: {
                            createdBy: true,
                            memberships: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            });

            return messages;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to get messages');
        }
    }

    private async resolveChatroomId(
        userId: string,
        otherUserId?: string,
    ): Promise<string | null> {
        if (!otherUserId) {
            throw new BadRequestException('otherUserId is required');
        }

        if (userId === otherUserId) {
            throw new BadRequestException('Cannot fetch messages with yourself');
        }

        const directChatroom = await this.prismaService.chatroom.findFirst({
            where: {
                isGroup: false,
                deletedAt: null,
                memberships: {
                    some: { userId },
                },
                AND: [
                    {
                        memberships: {
                            some: { userId: otherUserId },
                        },
                    },
                ],
            },
            select: {
                id: true,
            },
        });

        if (directChatroom) {
            return directChatroom.id;
        }

        const groupChatroom = await this.prismaService.chatroom.findFirst({
            where: {
                id: otherUserId,
                isGroup: true,
                deletedAt: null,
                memberships: {
                    some: { userId },
                },
            },
            select: {
                id: true,
            },
        });

        return groupChatroom?.id ?? null;
    }
}