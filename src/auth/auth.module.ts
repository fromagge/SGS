import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthController } from 'auth/auth.controller';
import { AuthGuard } from 'auth/auth.guard';
import { SupabaseService } from 'supabase/supabase.service';
import { AuthService, OAuthService } from 'auth/auth.service';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [AuthService, OAuthService, AuthGuard, SupabaseService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

