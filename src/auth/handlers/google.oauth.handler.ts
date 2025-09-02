import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleOAuthCommand } from '../commands/google.oauth.command';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { issueToken } from 'src/utils/issueToken';

@CommandHandler(GoogleOAuthCommand)
export class GoogleOAuthHandler implements ICommandHandler<GoogleOAuthCommand> {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: GoogleOAuthCommand): Promise<any> {
    const { code, res } = command;

    // Step 1: Exchange code for tokens
    const { id_token, access_token, error: tokenError } =
      await this.getGoogleOAuthTokens(code);

    if (tokenError) {
      throw new HttpException(tokenError, 400);
    }

    // Step 2: Get user profile
    const {
      id,
      email,
      verified_email,
      given_name,
      family_name,
      picture,
      error: userError,
    } = await this.getGoogleUser(access_token);

    if (userError) {
      throw new HttpException(userError.message, 400);
    }

    if (!verified_email) {
      throw new HttpException('Google account not verified', 400);
    }

    // Step 3: Upsert user
    let user: User | null = await this.prisma.user.findUnique({ where: { email } });
   
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstname: given_name,
          lastname: family_name,
          avatarUrl: picture,
          credential: {
            create: { googleId: id },
          },
        },
      });
    }

     return issueToken(user, this.jwtService, this.configService, res);
  }

  private async getGoogleOAuthTokens(code: string): Promise<any> {
    try {
      const url = 'https://oauth2.googleapis.com/token';
      const values = {
        code,
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      };

      const response = await this.httpService.axiosRef.post(
        url,
        new URLSearchParams(values),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      return response.data;
    } catch (error) {
      return error.response?.data || { error: 'Failed to fetch tokens' };
    }
  }

  private async getGoogleUser(access_token: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.get(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      return response.data;
    } catch (error) {
      return error.response?.data || { error: 'Failed to fetch user info' };
    }
  }
}
