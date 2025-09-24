import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddReactionCommand } from "../commands/addReaction.command";
import { PrismaService } from "src/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PostReactionEvent } from "../event/postReaction.event";

@CommandHandler(AddReactionCommand)
export class AddReactionHandler implements ICommandHandler<AddReactionCommand> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ){}
    async execute(command: AddReactionCommand): Promise<boolean> {
        const { userId, postId, ractionType } = command;

        try {
            
            const reaction = await this.prismaService.reaction.findUnique({
                where: {
                    postId_createdById : {
                        postId,
                        createdById: userId
                    }
                }
            });

            if (reaction) {
                // Update existing reaction
                await this.prismaService.reaction.update({
                    where: {
                        id: reaction.id
                    },
                    data: {
                        type: ractionType
                    }
                })
                const post = await this.prismaService.post.findUnique({ where: { id: postId } });
                if (post && post.createdById !== userId) {
                    this.eventEmitter.emit('post.reacted', new PostReactionEvent(postId, userId, post.createdById, reaction.id, ractionType));
                }
            } else {
                // Create new reaction
                const created = await this.prismaService.reaction.create({
                    data: {
                        type: ractionType,
                        post: {
                            connect: { id: postId }
                        },
                        createdBy: {
                            connect: { id: userId }
                        }
                    }
                })
                const post = await this.prismaService.post.findUnique({ where: { id: postId } });
                if (post && post.createdById !== userId) {
                    this.eventEmitter.emit('post.reacted', new PostReactionEvent(postId, userId, post.createdById, created.id, ractionType));
                }
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}