import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthController } from 'auth/auth.controller';
import { AuthGuard } from 'auth/auth.guard';
import { AuthService, OAuthService } from 'auth/auth.service';
import { SupabaseModule } from 'supabase/supabase.module';

@Module({
  imports: [HttpModule, CacheModule.register(), SupabaseModule],
  providers: [AuthService, OAuthService, AuthGuard],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
