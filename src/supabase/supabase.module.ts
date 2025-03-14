import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { SupabaseService } from 'supabase/supabase.service';

@Module({
  imports: [CacheModule.register()],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
