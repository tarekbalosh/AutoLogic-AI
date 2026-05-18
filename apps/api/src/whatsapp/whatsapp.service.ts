import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(AiService) private aiService: AiService
  ) {}

  /**
   * Send a text message via WhatsApp Cloud API
   */
  async sendMessage(organizationId: string, toPhone: string, text: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org?.waPhoneNumberId || !org?.waAccessToken) {
      throw new BadRequestException('WhatsApp is not configured for this organization');
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${org.waPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: toPhone,
          type: 'text',
          text: { body: text }
        },
        {
          headers: { Authorization: `Bearer ${org.waAccessToken}` }
        }
      );
      this.logger.log(`Message sent to ${toPhone}`);
    } catch (error: any) {
      this.logger.error(`Failed to send WhatsApp message to ${toPhone}`, error?.response?.data || error);
      throw error;
    }
  }

  /**
   * Send a template message (usually required to initiate contact)
   */
  async sendTemplate(organizationId: string, toPhone: string, templateName: string, languageCode = 'en_US') {
    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org?.waPhoneNumberId || !org?.waAccessToken) throw new BadRequestException('WhatsApp not configured');

    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${org.waPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: toPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode }
          }
        },
        { headers: { Authorization: `Bearer ${org.waAccessToken}` } }
      );
    } catch (error) {
      this.logger.error(`Failed to send template to ${toPhone}`, error);
      throw error;
    }
  }

  /**
   * Process incoming Webhook from WhatsApp
   */
  async processWebhook(body: any) {
    // 1. Validate payload structure
    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry) {
      const waPhoneNumberId = entry.id; // We use this to identify the Organization

      for (const change of entry.changes) {
        if (change.value.messages) {
          const message = change.value.messages[0];
          const contact = change.value.contacts[0];
          
          await this.handleIncomingMessage(waPhoneNumberId, message, contact);
        }
        
        // Handle statuses (read/delivered) if needed
        if (change.value.statuses) {
          // const status = change.value.statuses[0];
        }
      }
    }
  }

  private async handleIncomingMessage(waPhoneNumberId: string, message: any, contact: any) {
    const phone = contact.wa_id;
    const name = contact.profile?.name;
    const messageId = message.id; // Use for idempotency

    // Find the organization this number belongs to
    const org = await this.prisma.organization.findFirst({
      where: { waPhoneNumberId }
    });

    if (!org) {
      this.logger.warn(`Received message for unknown WA Phone ID: ${waPhoneNumberId}`);
      return;
    }

    // Rate Limiting (Anti-spam) check can be placed here using Redis

    // Find or create the Customer user
    let customer = await this.prisma.user.findUnique({ where: { phone } });
    if (!customer) {
      customer = await this.prisma.user.create({
        data: {
          phone,
          email: `${phone}@wa.temp`, // Temporary mock email
          name,
          role: 'CUSTOMER',
          organizationId: org.id,
          password: 'auto-generated-wa'
        }
      });
    }

    // Find active conversation or create new
    let conversation = await this.prisma.conversation.findFirst({
      where: { customerId: customer.id, organizationId: org.id, status: { in: ['OPEN', 'PENDING'] } }
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          customerId: customer.id,
          organizationId: org.id,
          status: 'OPEN'
        }
      });
    }

    // Enforce business hours
    const isWithinHours = this.checkBusinessHours();
    if (!isWithinHours && conversation.status === 'OPEN') {
      await this.sendMessage(org.id, phone, "We are currently outside of business hours (9AM-11PM GMT+3). Our AI assistant will try to help you, or a human will follow up tomorrow.");
    }

    let messageContent = '';
    
    // Handle Text
    if (message.type === 'text') {
      messageContent = message.text.body;
    } else {
      // Handle other types (image, audio, etc) by parsing ID and downloading via WA API
      messageContent = `[Received Media Type: ${message.type}]`;
    }

    // Save Customer Message
    const savedMessage = await this.prisma.message.create({
      data: {
        content: messageContent,
        conversationId: conversation.id,
        senderId: customer.id,
        isAi: false,
        metadata: { waMessageId: messageId }
      }
    });

    // If conversation is handled by AI, route to AI Service
    if (conversation.status === 'OPEN') {
      try {
        // Fetch history
        const history = await this.prisma.message.findMany({
          where: { conversationId: conversation.id, id: { not: savedMessage.id } },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        const formattedHistory = history.reverse().map(msg => ({
          role: (msg.isAi ? 'assistant' : 'user') as 'user' | 'assistant',
          content: msg.content
        }));

        const aiConfig = {
          organizationId: org.id,
          companyName: org.name,
          personality: 'Professional and helpful over WhatsApp.',
          guardrails: '',
          language: 'Arabic', // Default to Arabic
          plan: 'PRO' as any
        };

        const aiResult = await this.aiService.generateResponse(messageContent, formattedHistory, aiConfig);

        // Save AI Response
        await this.prisma.message.create({
          data: {
            content: aiResult.response,
            conversationId: conversation.id,
            isAi: true
          }
        });

        // Send via WhatsApp
        await this.sendMessage(org.id, phone, aiResult.response);

        if (aiResult.isHandoffRecommended) {
           await this.prisma.conversation.update({
             where: { id: conversation.id },
             data: { status: 'PENDING' }
           });
        }

      } catch (error) {
        this.logger.error('Failed to generate AI response for WA message', error);
      }
    }
  }

  private checkBusinessHours(): boolean {
    // Implement timezone logic. Hardcoded to true for demo.
    // E.g., GMT+3 9AM to 11PM
    const currentHour = new Date().getUTCHours() + 3; // GMT+3
    return currentHour >= 9 && currentHour <= 23;
  }

  /**
   * Verify X-Hub-Signature-256 for security
   */
  verifySignature(payload: string, signature: string): boolean {
    const appSecret = process.env.META_APP_SECRET || '';
    const hmac = crypto.createHmac('sha256', appSecret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return signature === digest;
  }
}
