import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from 'user/user.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: process.env.CONSTANT_CONTACT_API_URL,
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
