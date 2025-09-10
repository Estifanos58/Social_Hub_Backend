import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePostCommand } from '../commands/deletePost.command';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: DeletePostCommand): Promise<any> {
    try {
      const { postId, userId } = command;

      const post = await this.prismaService.post.findUnique({
        where: {
          createdById: userId,
          id: postId,
        },
      });

      if (!post) throw new NotFoundException('Post Not Found');

      await this.prismaService.post.update({
        where: {
          id: postId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return 'Post deleted Successfully';
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete post');
    }
  }
}
