import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { UserService } from 'user/user.service';
import { UserController } from 'user/user.controller';
import { AuthService } from 'auth/auth.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: process.env.CONSTANT_CONTACT_API_URL,
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService],
})
export class UserModule {}
