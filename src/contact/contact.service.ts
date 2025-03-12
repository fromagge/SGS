import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { Contact } from 'contact/contact.model';

interface ContactResponse {
  message: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly httpService: HttpService) {}

  async createContact(contact: Contact): Promise<ContactResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ContactResponse>('/contacts', contact),
      );
      this.logger.log(`Response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error creating contact', errorMessage);
      throw new HttpException(
        'Failed to create contact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
