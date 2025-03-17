import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

import { ClientJwtPayload } from 'auth/types';
import { ConstantContactAPIService } from 'api/api.service';
import { UserService } from 'user/user.service';
import { ContactModel, EmailAddress, PhoneNumber } from './contact.model';
import { OAuthService } from 'auth/auth.service';

interface ContactResponse {
  message: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly apiService: ConstantContactAPIService,
    private readonly userService: UserService,
  ) {}

  private async getAllContacts(token: string): Promise<Contact[]> {
    return await this.apiService.getAllContacts(token);
  }

  private async getContactsFromFile(
    file: Express.Multer.File,
  ): Promise<{ contacts: ContactModel[]; errors: string[] }> {
    const errors: string[] = [];
    const contacts: ContactModel[] = [];

    try {
      let data: Record<string, any>[] = [];
      // Check file extension
      const fileExt = file.mimetype;

      if (fileExt === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileExt === 'application/vnd.ms-excel') {
        
        const buffer = await file.buffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      } else if (fileExt === 'text/csv') {
        // Process CSV file
        const buffer = file.buffer;
        const text = buffer.toString('utf-8');
        const result = Papa.parse(text, { header: true });
        data = result.data as Record<string, any>[];
      } else {
        throw new Error(
          'Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV file.',
        );
      }

      // Process each row into a ContactModel
      data.forEach((row, index) => {
        const firstName = row['First name'] || '';
        const lastName = row['Last/Organization/Group/Household name'] || '';

        // Check for required fields
        if (!firstName || !lastName) {
          errors.push(`Row ${index + 1}: Missing required name fields`);
          return;
        }

        const email = row['Email Addresses\\Email address'] || '';
        const phone = row['Phones\\Number'] || '';

        // Check that at least one contact method exists
        if (!email && !phone) {
          errors.push(
            `Row ${index + 1}: At least one contact method (email or phone) is required`,
          );
          return;
        }

        // Create email address objects if present
        const emailAddresses = email
          ? [
              new EmailAddress(
                email,
                new Date(row['Email Addresses\\Date changed'] || new Date()),
              ),
            ]
          : [];

        // Create phone number objects if present
        const phoneNumbers = phone
          ? [
              new PhoneNumber(
                phone,
                new Date(row['Phones\\Date changed'] || new Date()),
              ),
            ]
          : [];

        // Create contact with address information if available
        const contact = new ContactModel(
          firstName,
          lastName,
          emailAddresses,
          phoneNumbers,
          row['System record ID'] || '',
          new Date(row['Date changed'] || new Date()),
          row['Todays Visitors Attribute\\Value'] === 'true',
          new Date(
            row['Todays Visitors Attribute\\Date changed'] || new Date(),
          ),
          row['Addresses\\Address line 1'] || '',
          row['Addresses\\Address line 2'] || '',
          row['Addresses\\City'] || '',
          row['Addresses\\ZIP'] || '',
          row['Addresses\\State abbreviation'] || '',
          row['Addresses\\Country abbreviation'] || '',
        );

        contacts.push(contact);
      });

      return { contacts, errors };
    } catch (error) {
      console.error('Error parsing file:', error);
      errors.push(
        'Failed to parse file. Please check the file format and try again.',
      );
      return { contacts, errors };
    }
  }

  async createContact(
    user: ClientJwtPayload,
    contact: Contact,
  ): Promise<ContactResponse> {
    const userToken = await this.userService.getUserToken(user);

    return await this.apiService.createContact(contact, userToken);
  }

  async getContacts(
    user: ClientJwtPayload,
    allContacts: boolean | undefined,
    from: Date | undefined,
  ): Promise<Contact[]> {
    const userToken = await this.userService.getUserToken(user);

    if (allContacts) {
      return await this.getAllContacts(userToken);
    }
    return (await this.apiService.getContacts(userToken, from)).contacts;
  }

  async createBulkContacts(user: ClientJwtPayload, file: Express.Multer.File): Promise<any> {
    const userToken = await this.userService.getUserToken(user);

    const { contacts, errors } = await this.getContactsFromFile(file);

    if (errors.length > 0) {
      this.logger.error('Errors found in file');
      this.logger.error(errors.join('\n'));
      throw new Error(errors.join('\n'));
    }

    return await this.apiService.createBulkContacts(contacts, userToken);
  }

  async isBulkUploading(user: ClientJwtPayload, activityId: string): Promise<any> {
    const userToken = await this.userService.getUserToken(user);
    const activity = await this.apiService.getActivityStatus(activityId, userToken);
    return activity.state === 'completed';
  }
}
