import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, { rawBody: true });
    
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

// Local development bootstrap
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3001, '0.0.0.0');
  const url = await app.getUrl();
  console.log(`API is running on: ${url}`);
}

if (!process.env.VERCEL) {
  bootstrap();
}

// Export serverless handler for Vercel
export default async (req: any, res: any) => {
  const server = await bootstrapServer();
  return server(req, res);
};
