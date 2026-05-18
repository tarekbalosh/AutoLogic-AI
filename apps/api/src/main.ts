import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  
  // Enable CORS for all origins in development
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Explicitly listen on 0.0.0.0 and port 3001
  await app.listen(3001, '0.0.0.0');
  const url = await app.getUrl();
  console.log(`API is running on: ${url}`);
}
bootstrap();
