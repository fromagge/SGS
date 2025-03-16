import { Injectable } from '@nestjs/common'; 
import { ClientJwtPayload } from 'auth/types';
import { ConstantContactAPIService } from 'api/api.service';

interface ContactResponse {
  message: string;
}

@Injectable()
export class ContactService {
  constructor(private readonly apiService: ConstantContactAPIService) {}

  private async getAllContacts(user: ClientJwtPayload): Promise<Contact[]> {
    return await this.apiService.getAllContacts(user.token);
  }

  async createContact(contact: Contact): Promise<ContactResponse> {
    return await this.apiService.createContact(contact);
  }

  async getContacts(user: ClientJwtPayload, allContacts: boolean | undefined, from: Date | undefined): Promise<Contact[]> {
    if (allContacts) {
      return await this.getAllContacts(user);
    }
    return (await this.apiService.getContacts(user.token, from)).contacts;
  }
}
