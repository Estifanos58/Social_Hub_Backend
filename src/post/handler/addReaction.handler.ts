import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddReactionCommand } from "../commands/addReaction.command";
import { PrismaService } from "src/prisma.service";

@CommandHandler(AddReactionCommand)
export class AddReactionHandler implements ICommandHandler<AddReactionCommand> {
    constructor(
        private readonly prismaService: PrismaService
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
            } else {
                // Create new reaction
                await this.prismaService.reaction.create({
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
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}