import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwksClient } from 'jwks-rsa';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';
import { JwtHeader, SigningKeyCallback, verify, sign } from 'jsonwebtoken';

import { SupabaseService } from 'supabase/supabase.service';
import { User } from 'supabase/types';
import { ClientJwtPayload } from 'auth/types';

@Injectable()
export class OAuthService {
  private readonly JWT_ISSUER = process.env.CONSTANT_CONTACT_JWT_ISSUER;
  private readonly logger = new Logger(OAuthService.name);

  private readonly stateExpirationTimeInSeconds = 60 * 5; // 5 minutes
  private states: Map<string, number> = new Map();

  constructor(private readonly httpService: HttpService) {}

  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15);
    this.states.set(state, Date.now());
    return state;
  }

  private generateCallbackUrl(): string {
    return 'http://localhost:3000/api/auth/callback';
  }

  private generateAuthHeader(): string {
    const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? '';
    const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET ?? '';

    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    )}`;
  }

  public validateState(state: string): boolean {
    const timestamp = this.states.get(state);

    if (!timestamp) {
      return false;
    }

    this.states.delete(state);

    const isStateExpired =
      timestamp + this.stateExpirationTimeInSeconds * 1000 < Date.now();

    return !isStateExpired;
  }

  public generateAuthUrl(): string {
    const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? '';
    const baseUrl =
      'https://authz.constantcontact.com/oauth2/default/v1/authorize';

    const url = new URL(baseUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', this.generateCallbackUrl());
    url.searchParams.set('response_type', 'code');
    url.searchParams.set(
      'scope',
      'offline_access account_update account_read contact_data',
    );
    url.searchParams.set('state', this.generateState());

    return url.toString();
  }

  public async getAccessToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('redirect_uri', this.generateCallbackUrl());
    params.append('grant_type', 'authorization_code');

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `https://authz.constantcontact.com/oauth2/default/v1/token`,
          params,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: this.generateAuthHeader(),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              `Failed to get access token: ${error.response?.data}`,
            );
            throw new Error('Failed to get access token');
          }),
        ),
    );

    return data;
  }

  public async verifyJwtToken(
    token: string,
    getClaims: boolean = false,
  ): Promise<any> {
    const client = new JwksClient({
      jwksUri: `${this.JWT_ISSUER}/v1/keys`,
    });

    function getKey(header: JwtHeader, callback: SigningKeyCallback) {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          return callback(err);
        }

        if (key) {
          const signingKey = key.getPublicKey();
          callback(null, signingKey);
        } else {
          callback(new Error('Key not found'));
        }
      });
    }

    return new Promise((resolve) => {
      verify(
        token,
        getKey,
        {
          algorithms: ['RS256'],
          issuer:
            'https://identity.constantcontact.com/oauth2/aus1lm3ry9mF7x2Ja0h8',
          audience: 'https://api.cc.email/v3',
        },
        (err, decoded) => {
          if (err) {
            this.logger.error('Invalid token', err);
            return resolve(getClaims ? null : false);
          }
          resolve(getClaims ? decoded : true);
        },
      );
    });
  }

  public async isTokenExpired(token: string): Promise<boolean> {
    const decoded = await this.verifyJwtToken(token, true);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Date.now() / 1000;
  }

  public async refreshToken(refreshToken: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`https://authz.constantcontact.com/oauth2/default/v1/token`, params, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: this.generateAuthHeader(),
          },
        }),
      );
      return data;
    } catch (error) {
      this.logger.error('Failed to refresh token', error);
      return null;
    }
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret = process.env.JWT_SECRET;
  private readonly jwtTokenExpirationTime = Number(
    process.env.JWT_EXPIRATION_TIME,
  );
  private readonly jwtRefreshTokenExpirationTime = Number(
    process.env.JWT_REFRESH_EXPIRATION_TIME,
  );

  constructor(private readonly supabase: SupabaseService) {}

  private isTokenExpired(token: string): boolean {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    const decoded = verify(token, this.jwtSecret);

    if (typeof decoded !== 'object' || !decoded || !('exp' in decoded)) {
      throw new Error('Invalid token');
    }

    return (decoded as ClientJwtPayload).exp! < Date.now() / 1000;
  }

  private validateToken(token: string): ClientJwtPayload {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    const decoded = verify(token, this.jwtSecret);

    if (typeof decoded !== 'object' || !decoded || !('exp' in decoded)) {
      throw new Error('Invalid token');
    }

    if (this.isTokenExpired(token)) {
      throw new Error('Token expired');
    }

    return decoded as ClientJwtPayload;
  }

  public validateClientSession(token: string): ClientJwtPayload {
    try {
      return this.validateToken(token);
    } catch (error) {
      this.logger.debug('Invalid token', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  public async createClientSession(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    if (!this.jwtTokenExpirationTime || !this.jwtRefreshTokenExpirationTime) {
      throw new Error('JWT_EXPIRATION_TIME is not set');
    }

    const payload: ClientJwtPayload = {
      email: user.email,
      id: user.id,
    };

    const accessToken = sign(payload, this.jwtSecret, {
      expiresIn: this.jwtTokenExpirationTime,
    });
    const refreshToken = sign(payload, this.jwtSecret, {
      expiresIn: this.jwtRefreshTokenExpirationTime,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtTokenExpirationTime,
    };
  }

  public async refreshClientSession(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    const refreshPayload: ClientJwtPayload = this.validateToken(
      refreshToken,
    ) as ClientJwtPayload;

    const user = await this.supabase.getUser(refreshPayload.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.createClientSession(user);
  }
}
