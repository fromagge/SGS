import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { ConstantContactAPIService } from 'api/api.service';
import { ClientJwtPayload } from 'auth/types';
import { SupabaseService } from 'supabase/supabase.service';
import { OAuthService } from 'auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly apiService: ConstantContactAPIService,
    private readonly supabase: SupabaseService,
    private readonly oauthService: OAuthService,
  ) {}

  private async getSessionData(user: ClientJwtPayload) {
    const session = await this.supabase.getSession(user.id);

    if (!session || !session.access_token || !session.refresh_token) {
      throw new UnauthorizedException('Session not found');
    }

    const isTokenExpired = await this.oauthService.isTokenExpired(
      session.access_token,
    );

    if (isTokenExpired) {
      const newSession = await this.oauthService.refreshToken(
        session.refresh_token,
      );
      if (!newSession) {
        throw new UnauthorizedException('Failed to refresh token');
      }
      await this.supabase.updateSession(session.id, {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
      });
      return {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
      };
    }

    return session;
  }

  async getUserSummary(user: ClientJwtPayload) {
    const session_data = await this.getSessionData(user);
    return await this.apiService.getUserSummary(session_data.access_token);
  }
}
