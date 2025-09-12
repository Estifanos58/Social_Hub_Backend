import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { issueToken } from 'src/utils/issueToken';

@Injectable()
export class GraphQLAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService
  ) {}
  async canActivate(
    context: ExecutionContext,
  ):Promise<boolean>  {
    const gqlCtx = context.getArgByIndex(2);
    const request: Request = gqlCtx.req;
    const response: Response = gqlCtx.res;
    const token = request.cookies?.access_token;

    // console.log("Token:", token);
    // console.log('Request Cookies:', request.cookies);

    
    if (!token) {
      const refreshToken = request.cookies?.refreshToken;

      if(!refreshToken){
        throw new UnauthorizedException();
      }

      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      })

      const user = await this.prismaService.user.findUnique({
        where: {id: payload.sub}
      })

      if(!user) {
        throw new UnauthorizedException(); 
      }

      issueToken(user, this.jwtService, this.configService, response)

      request['user'] = { sub: user.id, email: user.email, firstname: user.firstname };
      
      return true;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });

      request['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
