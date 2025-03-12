import { Body, Controller, Logger, Post } from '@nestjs/common';

import { Contact } from 'contact/contact.model';
import { ContactService } from 'contact/contact.service';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() contact: Contact): Promise<ContactResponse> {
    this.logger.log('Creating contact...');
    this.logger.debug('Debug payload', contact);
    const response = await this.contactService.createContact(contact);
    this.logger.log('Contact created successfully');
    return response;
  }
}

interface ContactResponse {
  message: string;
}
