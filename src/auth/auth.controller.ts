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
  async googleOAuthCallback(@Query("code") code: string, @Res() res: Response) {
    try {
      await this.commandBus.execute(new GoogleOAuthCommand(code, res));
    } catch (err) {
      console.error("Google OAuth Callback Error:", err);
      return res.status(400).json({ message: "OAuth failed" });
    }
  }

   @Get("github")
  async githubAuth(@Res() res: Response) {
    // console.log("GitHub OAuth initiated");
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URL}&scope=user:email`;
    return res.redirect(redirectUrl);
  }

    @Get("github/callback")
    async githubAuthCallback(@Query("code") code: string, @Res() res: Response) {
        return this.commandBus.execute(new GithubOAuthCommand(code, res));
    }


}
