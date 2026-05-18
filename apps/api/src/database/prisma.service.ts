import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@ai-support-hub/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn('Could not connect to database - some features will be unavailable. Make sure PostgreSQL is running at localhost:5432');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  get isAvailable(): boolean {
    return this.isConnected;
  }
}
