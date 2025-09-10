import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/UpdateUserCommand';
import { PrismaService } from 'src/prisma.service';
import {
    BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(command: UpdateUserCommand): Promise<User> {
    const {
      userId,
      firstname,
      lastname,
      bio,
      avatarUrl,
      isPrivate,
      twoFactorEnabled,
    } = command;

    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      const updatedUser = await this.prismaService.$transaction(async (prisma) => {
        if (twoFactorEnabled !== undefined) {
          await prisma.credential.update({
            where: { userId },
            data: { twoFactorEnabled },
          });
        }
        return await prisma.user.update({
          where: { id: userId },
          data: {
            firstname: firstname ?? user.firstname,
            lastname: lastname ?? user.lastname,
            bio: bio ?? user.bio,
            avatarUrl: avatarUrl ?? user.avatarUrl,
            isPrivate: isPrivate ?? user.isPrivate,
          },
        });
      });

      if(!updatedUser) throw new BadRequestException('Failed to update user');

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
