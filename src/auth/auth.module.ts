import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthService} from 'auth/auth.service';
import { AuthController } from 'auth/auth.controller';

@Module({
  imports: [HttpModule, CacheModule.register()],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
