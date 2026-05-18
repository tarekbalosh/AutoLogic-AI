import { Inject, forwardRef } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { ChatGateway } from './chat.gateway';
import { ChatEvent } from '@ai-support-hub/shared';
import { AiService } from '../ai/ai.service';

@Processor('chat-processing')
export class ChatProcessor extends WorkerHost {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
    @Inject(AiService) private aiService: AiService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { messageId, conversationId, content, organizationId } = job.data;

    this.chatGateway.server.to(`conv_${conversationId}`).emit(ChatEvent.TYPING_START, { userId: 'AI_AGENT' });

    try {
      // 1. Fetch Organization settings
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
        include: { subscription: true }
      });

      const config = {
        organizationId,
        companyName: org?.name || 'Support Company',
        personality: org?.aiPersonality || 'Professional, friendly, and helpful.',
        guardrails: org?.aiGuardrails || 'If unknown, offer human handoff.',
        language: org?.aiLanguage || 'English',
        plan: (org?.subscription?.plan as 'FREE' | 'PRO' | 'ENTERPRISE') || 'FREE',
        customApiKey: org?.openaiApiKey
      };

      // 2. Fetch Conversation History (last 10 messages)
      const rawHistory = await this.prisma.message.findMany({
        where: { conversationId, id: { not: messageId } },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const history = rawHistory.reverse().map(msg => ({
        role: (msg.isAi ? 'assistant' : 'user') as 'user' | 'assistant',
        content: msg.content
      }));

      // 3. Generate AI Response
      const aiResult = await this.aiService.generateResponse(content, history, config);

      // 4. Save AI message
      const aiMessage = await this.prisma.message.create({
        data: {
          content: aiResult.response,
          conversationId: conversationId,
          isAi: true,
          metadata: { tokensUsed: aiResult.tokensUsed, handoffRecommended: aiResult.isHandoffRecommended }
        }
      });

      // 5. Broadcast
      this.chatGateway.server.to(`conv_${conversationId}`).emit(ChatEvent.RECEIVE_MESSAGE, {
        id: aiMessage.id,
        conversationId: aiMessage.conversationId,
        content: aiMessage.content,
        senderId: null,
        isAi: true,
        status: 'SENT',
        createdAt: aiMessage.createdAt
      });

      // 6. Handoff
      if (aiResult.isHandoffRecommended) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { status: 'PENDING' }
        });
        this.chatGateway.server.to(`org_${organizationId}`).emit(ChatEvent.CONVERSATION_TRANSFER, {
          conversationId,
          reason: 'AI_HANDOFF'
        });
      }

    } catch (error) {
      console.error('AI Processing Error:', error);
      this.chatGateway.server.to(`conv_${conversationId}`).emit('system:message', {
        content: 'I encountered an error. Connecting you to a human.'
      });
    } finally {
      this.chatGateway.server.to(`conv_${conversationId}`).emit(ChatEvent.TYPING_STOP, { userId: 'AI_AGENT' });
    }

    return { success: true };
  }
}
