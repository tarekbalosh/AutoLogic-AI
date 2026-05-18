import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: any;

  constructor(@Inject(PrismaService) private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(orgId: string, priceId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) throw new NotFoundException('Organization not found');

    // Create or retrieve customer
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: `org-${org.id}@nexusai.com`, // Or use admin email
        metadata: { organizationId: org.id },
      });
      customerId = customer.id;
      await this.prisma.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
      metadata: { organizationId: org.id },
    });

    return { url: session.url };
  }

  async handleWebhook(sig: string, payload: Buffer) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, endpointSecret!);
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any;
        await this.updateSubscription(subscription);
        break;
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as any;
        await this.cancelSubscription(deletedSub);
        break;
    }
  }

  private async updateSubscription(subscription: any) {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0].price.id;

    // Map Price ID to our internal Plan tier
    let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE';
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'PRO';
    if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = 'ENTERPRISE';

    await this.prisma.organization.update({
      where: { stripeCustomerId: customerId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        subscription: {
          upsert: {
            create: { plan, status: 'ACTIVE' },
            update: { plan, status: 'ACTIVE' },
          },
        },
      },
    });
  }

  private async cancelSubscription(subscription: any) {
    const customerId = subscription.customer as string;
    await this.prisma.organization.update({
      where: { stripeCustomerId: customerId },
      data: {
        subscription: {
          update: { status: 'CANCELED' },
        },
      },
    });
  }
}
