import { Injectable, BadRequestException, NotFoundException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private s3Client: S3Client;

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    // @InjectQueue('document-processing') private documentQueue: Queue
  ) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock',
      },
    });
  }

  private getMockDocuments() {
    return [
      { id: '1', title: 'Company_Policies_2026.pdf', type: 'PDF', status: 'COMPLETED', sizeBytes: 2450000, createdAt: new Date() },
      { id: '2', title: 'https://support.acme.com/billing', type: 'URL', status: 'PROCESSING', sizeBytes: 12000, createdAt: new Date() },
      { id: '3', title: 'FAQ: Return Policy', type: 'MANUAL_FAQ', status: 'COMPLETED', sizeBytes: 500, createdAt: new Date() },
    ];
  }

  async listDocuments(organizationId: string) {
    if (!this.prisma.isAvailable) {
      return this.getMockDocuments();
    }
    return this.prisma.knowledgeDocument.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async checkStorageQuota(organizationId: string, incomingSizeBytes: number) {
    if (!this.prisma.isAvailable) return;

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true }
    });

    if (!org) throw new NotFoundException('Organization not found');

    const limits = {
      FREE: 50 * 1024 * 1024,
      PRO: 500 * 1024 * 1024,
      ENTERPRISE: 5 * 1024 * 1024 * 1024
    };

    const limit = limits[org.subscription?.plan || 'FREE'];

    const currentUsage = await this.prisma.knowledgeDocument.aggregate({
      where: { organizationId },
      _sum: { sizeBytes: true }
    });

    const totalUsage = (currentUsage._sum.sizeBytes || 0) + incomingSizeBytes;

    if (totalUsage > limit) {
      throw new BadRequestException('Storage quota exceeded for your current plan.');
    }
  }

  async uploadFile(organizationId: string, file: Express.Multer.File) {
    await this.checkStorageQuota(organizationId, file.size);

    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    let type: any = 'PDF';
    if (fileExt === 'docx') type = 'DOCX';
    if (fileExt === 'xlsx' || fileExt === 'xls') type = 'EXCEL';

    const sourceUrl = `s3://mock-bucket/knowledge/${organizationId}/${uuidv4()}-${file.originalname}`;

    if (!this.prisma.isAvailable) {
      return { id: uuidv4(), title: file.originalname, type, status: 'PENDING', sizeBytes: file.size, createdAt: new Date() };
    }

    const document = await this.prisma.knowledgeDocument.create({
      data: {
        title: file.originalname,
        sourceUrl,
        type,
        sizeBytes: file.size,
        organizationId,
        status: 'PENDING'
      }
    });

    /*
    try {
      await this.documentQueue.add('process-file', {
        documentId: document.id,
        organizationId,
        fileBuffer: file.buffer.toString('base64'),
        type,
      });
    } catch (e) {
      this.logger.warn('Failed to queue document processing - Redis might be down');
    }
    */

    return document;
  }

  async addUrl(organizationId: string, url: string) {
    if (!this.prisma.isAvailable) {
      return { id: uuidv4(), title: url, type: 'URL', status: 'PENDING', sizeBytes: 0, createdAt: new Date() };
    }

    const document = await this.prisma.knowledgeDocument.create({
      data: { title: url, sourceUrl: url, type: 'URL', organizationId, status: 'PENDING' }
    });

    /*
    try {
      await this.documentQueue.add('process-url', { documentId: document.id, organizationId, url });
    } catch (e) {
      this.logger.warn('Failed to queue URL processing');
    }
    */

    return document;
  }

  async deleteDocument(documentId: string, organizationId: string) {
    if (!this.prisma.isAvailable) return { success: true };

    const doc = await this.prisma.knowledgeDocument.findFirst({
      where: { id: documentId, organizationId }
    });
    
    if (!doc) throw new NotFoundException('Document not found');

    await this.prisma.knowledgeDocument.delete({ where: { id: documentId } });

    /*
    try {
      await this.documentQueue.add('delete-vectors', { documentId, organizationId });
    } catch (e) {}
    */

    return { success: true };
  }
}
