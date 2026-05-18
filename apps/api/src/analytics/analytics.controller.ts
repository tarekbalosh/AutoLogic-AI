import { Controller, Get, Query, Req, UseGuards, Inject } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@ai-support-hub/shared';

@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.ORG_ADMIN, Role.SUPER_ADMIN)
  async getDashboardData(
    @Req() req: any,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    const orgId = req.user?.orgId || 'demo-org-1';
    
    // Default to last 30 days
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    if (!startDateStr) startDate.setDate(endDate.getDate() - 30);

    const [kpis, chartData, leaderboard] = await Promise.all([
      this.analyticsService.getDashboardKpis(orgId, startDate, endDate),
      this.analyticsService.getConversationsChartData(orgId, startDate, endDate),
      this.analyticsService.getAgentLeaderboard(orgId, startDate, endDate),
    ]);

    return { kpis, chartData, leaderboard };
  }
}
