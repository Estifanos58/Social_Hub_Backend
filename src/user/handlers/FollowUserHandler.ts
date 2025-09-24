import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FollowUserCommand } from "../commands/FollowUserCommand";
import { PrismaService } from "src/prisma.service";
import { 
  BadRequestException,
  HttpException, 
  InternalServerErrorException, 
  NotFoundException 
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NewFollowerEvent } from "../event/newFollower.event";

@CommandHandler(FollowUserCommand)
export class FollowUserHandler implements ICommandHandler<FollowUserCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: FollowUserCommand): Promise<any> {
    const { userId, followingId } = command;

    try {

      if (userId === followingId) {
        throw new BadRequestException("You cannot follow yourself");
      }


      const follower = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (!follower) throw new NotFoundException("Follower not found");


      const following = await this.prismaService.user.findUnique({ where: { id: followingId } });
      if (!following) throw new NotFoundException("Following user not found");


      const existingFollow = await this.prismaService.follower.findUnique({
        where: { 
          followerId_followingId: { followerId: userId, followingId } 
        },
      });


      if (existingFollow) {
        throw new BadRequestException("You already follow this user");
      }

      // Create follow relation
      await this.prismaService.follower.create({
        data: {
          followerId: userId,
          followingId,
        },
      });

      // Fire and forget event
      this.eventEmitter.emit('user.followed', new NewFollowerEvent(userId, followingId));

      return "User started following";
    } catch (error) {
      if (error instanceof HttpException) throw error;

      // log error for debugging
      console.error("FollowUserHandler Error:", error);

      throw new InternalServerErrorException("Unexpected server error");
    }
  }
}
