import { Controller, Get, Post, Req, Res, HttpStatus, RawBodyRequest, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('webhooks/whatsapp')
export class WhatsappController {
  constructor(@Inject(WhatsappService) private readonly whatsappService: WhatsappService) {}

  /**
   * Meta Webhook Verification (Required when setting up the webhook in Meta App Dashboard)
   */
  @Get()
  verifyWebhook(@Req() req: Request, @Res() res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // This token must match what is entered in the Meta App Dashboard
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'my_secure_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK_VERIFIED');
      res.status(HttpStatus.OK).send(challenge);
    } else {
      res.sendStatus(HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Receive WhatsApp messages and statuses
   */
  @Post()
  async receiveWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    // 1. Verify Signature (Security)
    const signature = req.headers['x-hub-signature-256'] as string;
    
    // In production, req.rawBody must be enabled in NestJS bootstrap to verify the exact payload
    // if (!signature || !this.whatsappService.verifySignature(req.rawBody.toString(), signature)) {
    //   throw new UnauthorizedException('Invalid signature');
    // }

    const body = req.body;

    // 2. Respond to WhatsApp immediately (to prevent retries)
    res.sendStatus(HttpStatus.OK);

    // 3. Process asynchronously
    try {
      await this.whatsappService.processWebhook(body);
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }
}
