import { Controller, Get, Query, Res } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { GoogleOAuthCommand } from "./commands/google.oauth.command";
import { Response } from "express";
import { GithubOAuthCommand } from "./commands/github.oauth.command";

@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  // Step 1: Redirect user to Google
  @Get("google")
  async googleOAuth(@Res() res: Response) {
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
    return res.redirect(redirectUrl);
  }

  // Step 2: Google callback
  @Get("google/callback")
  async googleOAuthCallback(
    @Query("code") code: string,
    @Query("error") error: string | undefined,
    @Res() res: Response,
  ) {
    const clientUrl = this.getClientUrl();

    // If provider returned an error (user denied consent, etc.), redirect to frontend with the error
    if (error) {
      const redirect = `${clientUrl}/auth?oauthError=${encodeURIComponent(error)}`;
      return res.redirect(redirect);
    }

    if (!code) {
      const redirect = `${clientUrl}/auth?oauthError=${encodeURIComponent('no_code')}`;
      return res.redirect(redirect);
    }

    try {
      await this.commandBus.execute(new GoogleOAuthCommand(code, res));
    } catch (err) {
      console.error("Google OAuth Callback Error:", err);
      const redirect = `${clientUrl}/auth?oauthError=${encodeURIComponent('token_exchange_failed')}`;
      return res.redirect(redirect);
    }
  }

   @Get("github")
  async githubAuth(@Res() res: Response) {
    // console.log("GitHub OAuth initiated");
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URL}&scope=user:email`;
    return res.redirect(redirectUrl);
  }

    @Get("github/callback")
    async githubAuthCallback(
      @Query("code") code: string,
      @Query("error") error: string | undefined,
      @Res() res: Response,
    ) {
      const clientUrl = this.getClientUrl();

      if (error) {
        const redirect = `${clientUrl}/auth?oauthError=${encodeURIComponent(error)}`;
        return res.redirect(redirect);
      }

      if (!code) {
        const redirect = `${clientUrl}/auth?oauthError=${encodeURIComponent('no_code')}`;
        return res.redirect(redirect);
      }

      try {
        return await this.commandBus.execute(new GithubOAuthCommand(code, res));
      } catch (err) {
        console.error('GitHub OAuth Callback Error:', err);
        const redirect = `${clientUrl}/auth?oauthError=${encodeURIComponent('token_exchange_failed')}`;
        return res.redirect(redirect);
      }
    }

  private getClientUrl(): string {
    return this.commandBus ? (process.env.CLIENT_URL || 'http://localhost:3000') : (process.env.CLIENT_URL || 'http://localhost:3000');
  }


}
