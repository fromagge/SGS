import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { UserService } from 'user/user.service';
import { UserController } from 'user/user.controller';
import { ApiModule } from 'api/api.module';
import { SupabaseModule } from 'supabase/supabase.module';
import { AuthModule } from 'auth/auth.module';
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        baseURL: process.env.CONSTANT_CONTACT_API_URL,
        }),
      }),
    ApiModule,
    SupabaseModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}