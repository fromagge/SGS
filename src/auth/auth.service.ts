import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwksClient } from 'jwks-rsa';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtHeader, SigningKeyCallback, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly JWT_ISSUER =
    'https://identity.constantcontact.com/oauth2/aus1lm3ry9mF7x2Ja0h8';
  private readonly logger = new Logger(AuthService.name);
  private readonly stateExpirationTimeInSeconds = 60 * 5; // 5 minutes
  private states: Map<string, number> = new Map();

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
}
