import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCurrentUserQuery } from "../query/getCurrentUser.query";
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
    constructor(
        private readonly prismaService: PrismaService
    ){}
    async execute(query: GetCurrentUserQuery){
        const { userId } = query

        console.log('UserID: ', userId)

        try {
            const user = await this.prismaService.user.findUnique({
                where: {id: userId}
            })

            if(!user) {
                throw new NotFoundException('User Not Found')
            }

            // console.log('Current User: ', user)

            return user;
        } catch (error) {
            throw new InternalServerErrorException('Server Error')
        }
    }
}