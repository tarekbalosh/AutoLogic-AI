import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeProcessor } from './knowledge.processor';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    /*
    BullModule.registerQueue({
      name: 'document-processing',
    }),
    */
    AiModule,
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, /* KnowledgeProcessor */],
})
export class KnowledgeModule {}
