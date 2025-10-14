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
    const response: Response | undefined = gqlCtx.res;

    const authHeader = request.headers?.['authorization'];
    const headerAccessToken =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;
    const headerRefreshToken = request.headers?.['x-refresh-token'] as string | undefined;

    const renewSessionWithRefresh = async (refreshToken: string): Promise<boolean> => {
      try {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        });

        const user = await this.prismaService.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user) {
          throw new UnauthorizedException();
        }

        const { accessToken, refreshToken: newRefreshToken } = issueToken(
          user,
          this.jwtService,
          this.configService,
          response,
        );

        if (response) {
          response.setHeader('x-access-token', accessToken);
          response.setHeader('x-refresh-token', newRefreshToken);
        }

        request['user'] = { sub: user.id, email: user.email, firstname: user.firstname };

        return true;
      } catch (error) {
        throw new UnauthorizedException();
      }
    };

    if (headerAccessToken) {
      try {
        const payload = await this.jwtService.verifyAsync(headerAccessToken, {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        });

        request['user'] = payload;
        return true;
      } catch (err) {
        if (headerRefreshToken) {
          return renewSessionWithRefresh(headerRefreshToken);
        }
      }
    }

    if (headerRefreshToken) {
      return renewSessionWithRefresh(headerRefreshToken);
    }

    const cookieAccessToken = request.cookies?.accessToken ?? request.cookies?.access_token;
    if (cookieAccessToken) {
      try {
        const payload = await this.jwtService.verifyAsync(cookieAccessToken, {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        });

        request['user'] = payload;
        return true;
      } catch (err) {
        // fall through to refresh token handling
      }
    }

    const cookieRefreshToken = request.cookies?.refreshToken ?? request.cookies?.refresh_token;
    if (cookieRefreshToken) {
      return renewSessionWithRefresh(cookieRefreshToken);
    }

    throw new UnauthorizedException();
  }
}
