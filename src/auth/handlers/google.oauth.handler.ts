import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleOAuthCommand } from '../commands/google.oauth.command';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
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

    // console.log("Executing GoogleOAuthHandler with code:", code);

    try {
        // Step 1: Exchange code for tokens
    const { access_token} =
      await this.getGoogleOAuthTokens(code);

    // Step 2: Get user profile
    const {
      id,
      email,
      verified_email,
      given_name,
      family_name,
      picture,
    } = await this.getGoogleUser(access_token);

    if (!verified_email) {
      throw new HttpException('Google account not verified', 400);
    }

    // Step 3: Upsert user
    let user: User | null = await this.prisma.user.findUnique({ where: { email } });

    // console.log("Google OAuth user info:", { id, email, given_name, family_name });
   
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstname: given_name,
          lastname: family_name,
          avatarUrl: picture,
          verified: true,
          credential: {
            create: { googleId: id },
          },
        },
      });
    }

  const tokens = issueToken(user, this.jwtService, this.configService, res);

  // Append tokens to redirect URL so the frontend can pick them up after OAuth
  const clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:3000';
  const url = new URL('/auth/social-callback', clientUrl);
  if (tokens?.accessToken) url.searchParams.set('accessToken', tokens.accessToken);
  if (tokens?.refreshToken) url.searchParams.set('refreshToken', tokens.refreshToken);

  res.redirect(url.toString());
    } catch (error) {
      console.log("Error Google OAuth: ", error)
         if(error instanceof HttpException) {
                throw error;
              }
        throw new InternalServerErrorException("Internal Server Error")
    }
  }

  private async getGoogleOAuthTokens(code: string): Promise<any> {
    try {


//       console.log("Token exchange request:", {
//   code,
//   client_id: this.configService.get('GOOGLE_CLIENT_ID'),
//   redirect_uri: this.configService.get('GOOGLE_REDIRECT_URL'),
// });


      const url = 'https://oauth2.googleapis.com/token';
      const values = {
        code,
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get('GOOGLE_REDIRECT_URL'),
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
      console.error("Google token exchange error:", error.response?.data || error.message);
      throw new HttpException('Failed to fetch Google OAuth tokens', 400);
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
      console.log("Error: ", error.message, error)
      throw new HttpException('Failed to fetch Google user', 400);
    }
  }
}
