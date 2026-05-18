import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  /**
   * Cron Job: Runs every hour to aggregate daily analytics for all organizations.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async aggregateHourlyData() {
    this.logger.log('Running hourly analytics aggregation...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    const organizations = await this.prisma.organization.findMany({ select: { id: true } });

    for (const org of organizations) {
      // 1. Calculate totals for today
      const totalMessages = await this.prisma.message.count({
        where: { conversation: { organizationId: org.id }, createdAt: { gte: today } }
      });

      const aiResolvedConvs = await this.prisma.conversation.count({
        where: { 
          organizationId: org.id, 
          status: 'RESOLVED',
          agentId: null, // AI handled it entirely
          updatedAt: { gte: today }
        }
      });

      // 2. Upsert into AnalyticsDaily table
      await this.prisma.analyticsDaily.upsert({
        where: {
          organizationId_date: {
            organizationId: org.id,
            date: today
          }
        },
        update: {
          totalMessages,
          aiResolved: aiResolvedConvs,
        },
        create: {
          organizationId: org.id,
          date: today,
          totalMessages,
          aiResolved: aiResolvedConvs,
        }
      });
    }

    this.logger.log('Hourly analytics aggregation completed.');
  }

  /**
   * Fetch KPI metrics for the Dashboard
   */
  async getDashboardKpis(organizationId: string, startDate: Date, endDate: Date) {
    const totalConversations = await this.prisma.conversation.count({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate } }
    });

    const aiResolved = await this.prisma.conversation.count({
      where: { 
        organizationId, 
        status: 'RESOLVED', 
        agentId: null,
        createdAt: { gte: startDate, lte: endDate } 
      }
    });

    const csatScores = await this.prisma.conversation.aggregate({
      where: { organizationId, csatScore: { not: null }, createdAt: { gte: startDate, lte: endDate } },
      _avg: { csatScore: true }
    });

    const aiResolutionRate = totalConversations > 0 ? (aiResolved / totalConversations) * 100 : 0;
    const avgCsat = csatScores._avg.csatScore || 0;

    return {
      totalConversations,
      aiResolutionRate: aiResolutionRate.toFixed(1),
      avgCsat: avgCsat.toFixed(1),
      avgResponseTime: '1.2m', // Mock for now, would calculate from message timestamps
    };
  }

  /**
   * Fetch data for Recharts (Conversations over time)
   */
  async getConversationsChartData(organizationId: string, startDate: Date, endDate: Date) {
    // Note: In production, use raw SQL `date_trunc` for efficient grouping
    const dailyAnalytics = await this.prisma.analyticsDaily.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    return dailyAnalytics.map(data => ({
      date: data.date.toISOString().split('T')[0],
      total: data.totalMessages,
      aiResolved: data.aiResolved,
    }));
  }

  /**
   * Fetch Agent Leaderboard
   */
  async getAgentLeaderboard(organizationId: string, startDate: Date, endDate: Date) {
    const agents = await this.prisma.user.findMany({
      where: { organizationId, role: 'AGENT' },
      include: {
        assignedConvs: {
          where: { createdAt: { gte: startDate, lte: endDate } },
          select: { status: true, csatScore: true }
        }
      }
    });

    return agents.map(agent => {
      const resolved = agent.assignedConvs.filter(c => c.status === 'RESOLVED').length;
      const ratedConvs = agent.assignedConvs.filter(c => c.csatScore !== null);
      const avgCsat = ratedConvs.length > 0 
        ? ratedConvs.reduce((acc, c) => acc + (c.csatScore || 0), 0) / ratedConvs.length 
        : 0;

      return {
        id: agent.id,
        name: agent.name,
        conversationsHandled: agent.assignedConvs.length,
        resolutionRate: agent.assignedConvs.length > 0 ? (resolved / agent.assignedConvs.length) * 100 : 0,
        csatScore: avgCsat
      };
    }).sort((a, b) => b.resolutionRate - a.resolutionRate); // Highest resolution rate first
  }
}
