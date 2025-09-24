import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../command/createComment.command";
import { PrismaService } from "src/prisma.service";
import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CommentCreatedEvent } from "../event/commentCreated.event";
import { ReplyCreatedEvent } from "../event/replyCreated.event";

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ){}
    async execute(command: CreateCommentCommand): Promise<any> {
        const { postId, authorId, content, parentId } = command;

        try {
            const post = await this.prismaService.post.findUnique({
                where: { id: postId },
            });

            if (!post) throw new NotFoundException('Post not found');

            if (parentId) {
                const parentComment = await this.prismaService.comment.findUnique({
                    where: { id: parentId },
                });
                if (!parentComment || parentComment.postId !== postId) throw new NotFoundException('Parent comment not found');
            
                let depth = 1;
                let current: any = parentComment;

                while (current.parentId) {
                    depth++;
                    if (depth >= 3) throw new BadRequestException('Maximum comment depth exceeded');
                    current = await this.prismaService.comment.findUnique({
                        where: { id: current.parentId },
                    });
                    if (!current) break;
                }
            }

           const comment =  await this.prismaService.comment.create({
                data: {
                    postId,
                    createdById : authorId,
                    content,
                    parentId: parentId || null,
                },
            });

            // Emit events without await
            if (parentId) {
                const parent = await this.prismaService.comment.findUnique({ where: { id: parentId } });
                if (parent) {
                    this.eventEmitter.emit('comment.replyCreated', new ReplyCreatedEvent(parentId, comment.id, parent.createdById, authorId, content.slice(0, 120)));
                }
            } else {
                if (post.createdById !== authorId) {
                    this.eventEmitter.emit('comment.created', new CommentCreatedEvent(postId, comment.id, post.createdById, authorId, content.slice(0, 120)));
                }
            }

            return comment;
        } catch (error) {
            if(error instanceof HttpException)  throw error;
            throw new InternalServerErrorException('Failed to create comment');
        }
    }
}