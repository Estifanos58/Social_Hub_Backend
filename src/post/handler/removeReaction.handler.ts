import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveReactionCommand } from "../commands/removeReaction.command";
import { PrismaService } from "src/prisma.service";

@CommandHandler(RemoveReactionCommand)
export class RemoveReactionHandler implements ICommandHandler<RemoveReactionCommand> {
    constructor(
        private readonly prismaService: PrismaService,
    ){}
    async execute(command: RemoveReactionCommand): Promise<boolean> {
        const { postId, userId } = command;

        try {
            const reaction = await this.prismaService.reaction.findUnique({
                where: {
                    postId_createdById: {
                        postId,
                        createdById: userId,
                    },
                },
            });
            if (!reaction) {
                return false;
            }
            await this.prismaService.reaction.delete({
                where: {
                    id: reaction.id,
                },
            });

            return true;
        } catch (error) {
            return false;
        }
    }
}