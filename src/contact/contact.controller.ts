import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  BadRequestException,
  Req,
} from '@nestjs/common';

import { ContactService } from 'contact/contact.service';

@Controller('contacts')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Get()
  async getContacts(
    @Req() req: any,
    @Query('allContacts') allContacts?: boolean,
    @Query('from') from?: string,
  ): Promise<Contact[]> {
    // Validate that exactly one parameter is provided
    const hasAllContacts = allContacts !== undefined;
    const hasFrom = from !== undefined;

    if ((hasAllContacts && hasFrom) || (!hasAllContacts && !hasFrom)) {
      throw new BadRequestException(
        'Provide exactly one parameter: either "allContacts" or "from"',
      );
    }

    let date: Date | undefined = undefined;

    if (hasFrom) {
      try {
        date = new Date(from);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        throw new BadRequestException(
          'The "from" parameter must be a valid ISO date format (e.g., YYYY-MM-DD)',
        );
      }
    }

    return this.contactService.getContacts(req.user, allContacts, date);
  }

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
