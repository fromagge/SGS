import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ContactModel } from 'contact/contact.model';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConstantContactAPIService {
  private readonly contactLimit = 500;
  private readonly baseUrl = process.env.CONSTANT_CONTACT_API_URL;
  private readonly logger = new Logger(ConstantContactAPIService.name);

  constructor(private readonly httpService: HttpService) {}

  private getHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async get(
    path: string,
    token: string,
    query: any = {},
  ): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${path}`, {
          headers: this.getHeaders(token),
          params: query,
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

  private async getContactLists(token: string) {
    return await this.get('/v3/contact_lists', token);
  }

  async getUserSummary(token: string) {
    return await this.get('/v3/account/summary', token);
  }

  async getAllContacts(token: string): Promise<Contact[]> {
    const response = await this.getContacts(token, undefined);

    if (response.contacts_count < this.contactLimit) {
      return response.contacts;
    }
    const allContacts = response.contacts;
    let nextLink = response._links?.next?.href;

    while (nextLink) {
      const nextResponse = await this.get(nextLink, token);
      allContacts.push(...nextResponse.contacts);
      nextLink = nextResponse._links?.next?.href;
    }

    return allContacts;
  }

  async getContacts(
    token: string,
    from: Date | undefined,
  ): Promise<ContactsResponse> {
    const query = {
      limit: this.contactLimit,
      status: 'all',
      include_count: true,
    };

    if (from) {
      query['updated_after'] = from.toISOString();
    }

    return await this.get('/v3/contacts', token, query);
  }

  async createContact(contact: Contact, token: string) {
    return await this.post('/v3/contacts', contact, token);
  }

  async createBulkContacts(contacts: ContactModel[], token: string) {
    const contactLists = await this.getContactLists(token);

    if (contactLists.lists.length === 0) {
      throw new Error('No contact lists found');
    }

    const contactListId = contactLists.lists[0].list_id;

    const payload = {
      import_data: contacts.map((c) => c.to_json()),
      list_ids: [contactListId],
      sms_permission_to_send: 'explicit',
    };

    return await this.post(
      '/v3/activities/contacts_json_import',
      payload,
      token,
    );
  }

  async getActivityStatus(activityId: string, token: string) {
    return await this.get(`/v3/activities/${activityId}`, token);
  }
}
