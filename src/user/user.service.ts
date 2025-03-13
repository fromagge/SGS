import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import User from 'user/user.model';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}

  private getHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getUserSummary(token: string): Promise<User> {
    const url = `/account/summary`;
    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        headers: this.getHeaders(token),
      }),
    );
    return data;
  }
}
