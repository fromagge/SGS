import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  BadRequestException,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ContactService } from 'contact/contact.service';

@Controller('contacts')
export class ContactController {

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
  async create(@Req() req: any, @Body() contact: Contact): Promise<any> {
    const response = await this.contactService.createContact(req.user, contact);
    return {
      message: 'Contact created successfully',
      contact: response,
    };
  }

  @Post('bulk')
  @UseInterceptors(FileInterceptor('file'))
  async createBulk(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /(csv|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    const response = await this.contactService.createBulkContacts(
      req.user,
      file,
    );

    return {
      message: 'Contacts uploaded successfully',
      activity_id: response?.activity_id,
    };
  }

  @Get('bulk/:activityId')
  async isBulkUploading(
    @Req() req: any,
    @Param('activityId') activityId: string,
  ): Promise<any> {
    return {
      isDone: await this.contactService.isBulkUploading(req.user, activityId),
    };
  }
}
