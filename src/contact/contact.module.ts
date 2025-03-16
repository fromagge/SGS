import { Module } from '@nestjs/common';

import { ContactService } from 'contact/contact.service';
import { ContactController } from 'contact/contact.controller';
import { ApiModule } from 'api/api.module';

@Module({
  imports: [
    ApiModule
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
