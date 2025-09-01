import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserQuery } from "../query/getUser.query";
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
    constructor(
        private readonly prismaService: PrismaService
    ){}
    async execute(query: GetUserQuery){
        const { userId } = query

        try {
            const user = await this.prismaService.user.findUnique({
                where: {id: userId}
            })

            if(!user) {
                throw new NotFoundException('User Not Found')
            }

            return user;
        } catch (error) {
            throw new InternalServerErrorException('Server Error')
        }
    }
}