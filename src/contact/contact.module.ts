import { Module } from '@nestjs/common';

import { ContactService } from 'contact/contact.service';
import { ContactController } from 'contact/contact.controller';
import { ApiModule } from 'api/api.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [ApiModule, UserModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
