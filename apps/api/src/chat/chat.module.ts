import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatProcessor } from './chat.processor';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    /*
    BullModule.registerQueue({
      name: 'chat-processing',
    }),
    */
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
    }),
    AiModule,
  ],
  providers: [ChatGateway, ChatService, /* ChatProcessor */],
  exports: [ChatGateway],
})
export class ChatModule {}
