import {
  Redirect,
  Controller,
  Get,
  Logger,
  Query,
  UnauthorizedException,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService, OAuthService } from 'auth/auth.service';
import { SupabaseService } from 'supabase/supabase.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly oauthService: OAuthService,
    private readonly authService: AuthService,
    private readonly supabase: SupabaseService,
  ) {}

  @Get('login')
  login() {
    return {
      url: this.oauthService.generateAuthUrl(),
    };
  }

  @Get('callback')
  @Redirect('/')
  async callback(@Query('code') code: string, @Query('state') state: string) {
    if (!this.oauthService.validateState(state)) {
      return { error: 'Invalid state' };
    }

    const tokenData = await this.oauthService.getAccessToken(code);
    const tokenClaims = await this.oauthService.verifyJwtToken(
      tokenData.access_token,
      true,
    );

    if (!tokenClaims) {
      return { url: '/', message: 'Invalid token' };
    }

    const user = await this.supabase.createOrGetUser(tokenClaims.sub);
    await this.supabase.createSession(user, tokenData);
    const clientSession = await this.authService.createClientSession(user);

    const url = new URL('http://localhost:3000/access-token');
    url.searchParams.set('token', clientSession.accessToken);
    url.searchParams.set('refresh_token', clientSession.refreshToken);
    url.searchParams.set('expires_in', clientSession.expiresIn.toString());

    this.logger.debug(`Redirect URL: ${url.toString()}`);

    return { url: url.toString() };
  }

  @Post('refresh')
  async refresh(@Req() req: any) {
    const { token } = req.headers['authorization'];
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return await this.authService.refreshClientSession(token, refreshToken);
  }
}
