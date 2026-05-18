import { Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // We only enable BullModule if we don't want it to hang startup
    // For now, let's make it very lazy or disable it if we just want the API up
    /*
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
      },
    }),
    */
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    ChatModule,
    KnowledgeModule,
    WhatsappModule,
    AnalyticsModule,
    BillingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
