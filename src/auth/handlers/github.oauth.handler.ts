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
      // console.log('GitHub OAuth code:', code);
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
            firstname: login,
            avatarUrl,
            credential: {
              create: { githubId: id.toString() },
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
      console.error('GitHub OAuth Error:', error);
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
      console.log("GitHub OAuth token response:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error: ",error)
      throw new Error(`Failed to fetch GitHub OAuth tokens: ${error.message}`);
    }
  }

  private async getGithubUser(access_token: string): Promise<any> {
  try {
    // 1. Get the user profile
    const userUrl = 'https://api.github.com/user';
    const userRes = await this.httpService.axiosRef.get(userUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log("GitHub user profile response:", userRes.data);

    // 2. Get the user's emails (this returns an array of objects)
    const emailUrl = 'https://api.github.com/user/emails';
    const emailRes = await this.httpService.axiosRef.get(emailUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log("GitHub user emails response:", emailRes.data);

    if (!Array.isArray(emailRes.data) || emailRes.data.length === 0) {
      throw new Error('No emails associated with this GitHub account');
    }

    // Find the primary email (GitHub marks one as primary)
    const primaryEmail = emailRes.data.find((email) => email.primary)?.email;

    const { id, login, name, avatar_url } = userRes.data;

    return { id, login, email: primaryEmail, name, avatarUrl: avatar_url };
  } catch (error) {
    throw new Error(`Failed to fetch GitHub user: ${error.message}`);
  }
}

}
