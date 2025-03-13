import {
  Redirect,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'auth/auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}
  @Get('login')
  @UseGuards()
  login() {
    return {
      url: this.authService.generateAuthUrl(),
    };
  }

  @Get('callback')
  @Redirect("/")
  @UseGuards()
  async callback(@Query('code') code: string, @Query('state') state: string) {
    this.logger.debug(
      `Callback received with code: ${code} and state: ${state}`,
    );

    if (!this.authService.validateState(state)) {
      return { error: 'Invalid state' };
    }

    const tokenData = await this.authService.getAccessToken(code);
    const isTokenValid = await this.authService.verifyJwtToken(
      tokenData.access_token,
    );

    if (!isTokenValid) {
      return { redirect: '/', message: 'Invalid token' };
    }

    const url = new URL('http://localhost:3000/access-token');
    url.searchParams.set('token', tokenData.access_token);
    url.searchParams.set('expires_in', tokenData.expires_in.toString());

    this.logger.debug(`Redirect URL: ${url.toString()}`);

    return { url: url.toString() };
  }
}
