import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GithubOAuthCommand } from '../commands/github.oauth.command';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { issueToken } from 'src/utils/issueToken';
import { User } from '@prisma/client';

@CommandHandler(GithubOAuthCommand)
export class GithubOAuthHandler implements ICommandHandler<GithubOAuthCommand> {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async execute(command: GithubOAuthCommand): Promise<any> {
    const { code, response } = command;
    try {
      console.log('GitHub OAuth code:', code);
      const { access_token } = await this.getGithubOAuthTokens(code);
      const { id, login, email, name, avatarUrl } =
        await this.getGithubUser(access_token);

      if (!email) {
        throw new NotFoundException('GitHub account has no email associated');
      }

      let user: User | null = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            firstname: name || login,
            avatarUrl,
            credential: {
              create: { githubId: id },
            },
          },
        });
      }

      issueToken(user, this.jwtService, this.configService, response);

      response.redirect(
        this.configService.get('CLIENT_URL') || 'http://localhost:3000',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  private async getGithubOAuthTokens(
    code: string,
  ): Promise<{ access_token: string }> {
    const url = 'https://github.com/login/oauth/access_token';
    const values = {
      code,
      client_id: this.configService.get('GITHUB_CLIENT_ID'),
      client_secret: this.configService.get('GITHUB_CLIENT_SECRET'),
    };

    try {
      const response = await this.httpService.axiosRef.post(url, values, {
        headers: {
          Accept: 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch GitHub OAuth tokens: ${error.message}`);
    }
  }

  private async getGithubUser(access_token: string): Promise<any> {
    try {
      const url = 'https://api.github.com/user/';

      const userRes = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const emailRes = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const primaryEmailRes = emailRes.data.find(
        (email) => email.primary,
      )?.email;

      const { id, login, name, avatarUrl } = userRes.data;
      const email = primaryEmailRes;
      return { id, login, email, name, avatarUrl };
    } catch (error) {
      throw new Error(`Failed to fetch GitHub user: ${error.message}`);
    }
  }
}
