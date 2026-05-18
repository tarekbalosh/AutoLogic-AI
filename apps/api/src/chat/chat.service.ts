import { Injectable, ForbiddenException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SendMessageDto, ChatMessage } from '@ai-support-hub/shared';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AiService } from '../ai/ai.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    // @InjectQueue('chat-processing') private chatQueue: Queue,
    @Inject(AiService) private aiService: AiService,
  ) {}

  async enforceMessageLimit(organizationId: string) {
    if (!this.prisma.isAvailable) return; // Skip limit check in demo mode

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true }
    });

    if (!org) throw new NotFoundException('Organization not found');

    const planLimits = {
      FREE: 500,
      PRO: 5000,
      ENTERPRISE: Infinity
    };

    const limit = planLimits[org.subscription?.plan || 'FREE'];
    
    // Get current month's start date
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const messageCount = await this.prisma.message.count({
      where: {
        conversation: { organizationId },
        createdAt: { gte: startOfMonth }
      }
    });

    if (messageCount >= limit) {
      throw new ForbiddenException(`Message limit reached for plan: ${org.subscription?.plan || 'FREE'}`);
    }
  }

  async saveMessage(dto: SendMessageDto, senderId: string, isAi = false): Promise<ChatMessage> {
    let message: any;

    if (this.prisma.isAvailable) {
      try {
        const conversation = await this.prisma.conversation.findUnique({
          where: { id: dto.conversationId }
        });

        if (!conversation) throw new NotFoundException('Conversation not found');

        await this.enforceMessageLimit(conversation.organizationId);

        message = await this.prisma.message.create({
          data: {
            content: dto.content,
            conversationId: dto.conversationId,
            senderId: isAi ? null : senderId,
            isAi,
            metadata: { status: 'SENT', fileUrl: dto.fileUrl }
          }
        });
      } catch (e) {
        this.logger.error('Failed to save message to DB', e);
        // Fallback to mock message if DB fails after check
      }
    }

    // Mock message if DB was unavailable or failed
    if (!message) {
      message = {
        id: uuidv4(),
        conversationId: dto.conversationId,
        content: dto.content,
        senderId: isAi ? null : senderId,
        isAi,
        createdAt: new Date(),
      };
    }

    return {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      senderId: message.senderId,
      isAi: message.isAi,
      status: 'SENT',
      createdAt: message.createdAt,
      fileUrl: dto.fileUrl
    };
  }

  /**
   * Generates a response directly (fallback when queue is down)
   */
  async generateDirectResponse(conversationId: string, content: string, organizationId: string): Promise<ChatMessage> {
    const config = {
      organizationId,
      companyName: 'Support AI',
      personality: 'Professional, friendly, and helpful.',
      guardrails: 'Demo mode: No database connectivity.',
      language: 'English',
      plan: 'FREE' as const
    };

    const aiResult = await this.aiService.generateResponse(content, [], config);

    return {
      id: uuidv4(),
      conversationId,
      content: aiResult.response,
      senderId: null,
      isAi: true,
      status: 'SENT',
      createdAt: new Date()
    };
  }

  async requestHandoff(conversationId: string) {
    if (!this.prisma.isAvailable) return null;

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    
    if(!conversation) throw new NotFoundException('Conversation not found');

    const agents = await this.prisma.user.findMany({
      where: { 
        organizationId: conversation.organizationId,
        role: 'AGENT'
      },
      include: {
        _count: {
          select: { conversations: { where: { status: 'PENDING' } } }
        }
      },
      orderBy: {
        conversations: { _count: 'asc' }
      },
      take: 1
    });

    if (agents.length === 0) return null;

    const assignedAgent = agents[0];

    const updatedConv = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'PENDING' }
    });

    return { assignedAgent, conversation: updatedConv };
  }
}
