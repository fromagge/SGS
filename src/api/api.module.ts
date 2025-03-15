import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConstantContactAPIService } from './api.service';

@Module({
  imports: [HttpModule],
  providers: [ConstantContactAPIService],
  exports: [ConstantContactAPIService],
})
export class ApiModule {}   