import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, Req, UseGuards, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@ai-support-hub/shared';

@Controller('knowledge')
@UseGuards(RolesGuard)
export class KnowledgeController {
  constructor(@Inject(KnowledgeService) private readonly knowledgeService: KnowledgeService) {}
  @Get('list')
  @Roles(Role.ORG_ADMIN, Role.AGENT)
  async listDocuments(@Req() req: any) {
    const orgId = req.user?.orgId || 'demo-org-1';
    return this.knowledgeService.listDocuments(orgId);
  }

  @Post('upload')
  @Roles(Role.ORG_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const orgId = req.user?.orgId || 'demo-org-1'; // fallback for demo
    return this.knowledgeService.uploadFile(orgId, file);
  }

  @Post('url')
  @Roles(Role.ORG_ADMIN)
  async addUrl(
    @Body('url') url: string,
    @Req() req: any
  ) {
    const orgId = req.user?.orgId || 'demo-org-1';
    return this.knowledgeService.addUrl(orgId, url);
  }

  @Post('faq')
  @Roles(Role.ORG_ADMIN)
  async addFaq(
    @Body() body: { question: string; answer: string },
    @Req() req: any
  ) {
    const orgId = req.user?.orgId || 'demo-org-1';
    return this.knowledgeService.addManualFaq(orgId, body.question, body.answer);
  }

  @Delete(':id')
  @Roles(Role.ORG_ADMIN)
  async deleteDocument(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const orgId = req.user?.orgId || 'demo-org-1';
    return this.knowledgeService.deleteDocument(id, orgId);
  }
}
