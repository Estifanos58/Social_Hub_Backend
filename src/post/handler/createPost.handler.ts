import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '../commands/createPost.command';
import { PrismaService } from 'src/prisma.service';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: CreatePostCommand): Promise<any> {
    const { userId, content, imageUrls } = command;

    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const validImageUrls = Array.isArray(imageUrls)
        ? imageUrls.filter(
            (url) => typeof url === 'string' && url.trim() !== '',
          )
        : [];

      if (validImageUrls.length > 5) {
        throw new HttpException(
          'You can only attach up to 5 images per post',
          HttpStatus.BAD_REQUEST,
        );
      }

      const post = await this.prismaService.post.create({
        data: {
          createdById: userId,
          content,
          imageUrls: validImageUrls,
        },
      });

      return "Post created Successfully";
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create post');
    }
  }
}
