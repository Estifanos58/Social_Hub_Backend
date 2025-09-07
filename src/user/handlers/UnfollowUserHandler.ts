import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnFollowUserCommand } from "../commands/UnFollowUserCommand";
import { HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";


@CommandHandler(UnFollowUserCommand)
export class UnFollowUserHandler implements ICommandHandler<UnFollowUserCommand>{

      constructor(private readonly prismaService: PrismaService) {}
    
    async execute(command: UnFollowUserCommand): Promise<any> {
        const { userId, followingId } = command

        try {
            
            const existingFollow = await this.prismaService.follower.findUnique({
                where: {
                    followerId_followingId: {followerId: userId, followingId}
                }
            }) 

            if(!existingFollow) throw new NotFoundException("You Are Not Following this User")
            
            await this.prismaService.follower.delete({
                where: {
                    followerId_followingId: {followerId: userId, followingId}
                }
            })

            return "User UnFollowed SuccessFully"
        } catch (error) {
              if (error instanceof HttpException) throw error;
            
                  // log error for debugging
                  console.error("UnFollowUserHandler Error:", error);
            
                  throw new InternalServerErrorException("Unexpected server error");
        }
    }
}