import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthService } from 'auth/auth.service';
import { AuthController } from 'auth/auth.controller';
import { AuthGuard } from 'auth/auth.guard';
@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

