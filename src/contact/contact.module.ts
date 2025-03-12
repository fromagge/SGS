import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ContactService } from 'contact/contact.service';
import { ContactController } from 'contact/contact.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: process.env.CONSTANT_CONTACT_API_URL,
        headers: {
          Authorization: `Bearer ${process.env.CONSTANT_CONTACT_API_KEY}`,
        },
      }),
    }),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
