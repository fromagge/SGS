import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConstantContactAPIService {
  constructor(private readonly httpService: HttpService) {}

  private readonly baseUrl = process.env.CONSTANT_CONTACT_API_URL;
  private readonly logger = new Logger(ConstantContactAPIService.name);

  private getHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async get(path: string, token: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${path}`, {
          headers: this.getHeaders(token),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error('Error getting data from Constant Contact API', error);
      return null;
    }
  }

  private async post(path: string, body: any, token: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}${path}`, body, {
          headers: this.getHeaders(token),
        }),
      );
      return data;
    } catch (error) {
      this.logger.error('Error posting data to Constant Contact API', error);
      return null;
    }
  }

  async getUserSummary(token: string) {
    return await this.get('/account/summary', token);
  }
}
