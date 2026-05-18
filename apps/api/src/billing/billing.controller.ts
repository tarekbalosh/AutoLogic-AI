import { Controller, Post, Body, Req, UseGuards, Headers, RawBodyRequest, Inject } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('billing')
export class BillingController {
  constructor(@Inject(BillingService) private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Req() req: any, @Body('priceId') priceId: string) {
    const orgId = req.user.orgId || 'demo-org-1';
    return this.billingService.createCheckoutSession(orgId, priceId);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.billingService.handleWebhook(sig, req.rawBody as any);
  }
}
