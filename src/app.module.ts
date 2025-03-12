import { join } from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from 'user/user.module';
import { AuthService } from 'auth/auth.service';
import { ContactModule } from 'contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
    }),
    UserModule,
    ContactModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthService,
    },
  ],
})
export class AppModule {}
