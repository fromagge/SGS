import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('PORT') ?? 3000;
  app.setGlobalPrefix('api');

  await app.listen(PORT);
  Logger.log(`Server is running on port ${PORT} 🚀`);
}

void bootstrap();
