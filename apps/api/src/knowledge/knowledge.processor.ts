import { Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { RagService } from '../ai/rag.service';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import axios from 'axios';

@Processor('document-processing')
export class KnowledgeProcessor extends WorkerHost {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(RagService) private ragService: RagService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { documentId, organizationId } = job.data;

    try {
      await this.updateStatus(documentId, 'PROCESSING');

      let textContent = '';

      switch (job.name) {
        case 'process-file':
          textContent = await this.parseFile(job.data.fileBuffer, job.data.type);
          break;
        case 'process-url':
          textContent = await this.scrapeUrl(job.data.url);
          break;
        case 'ingest-text':
          textContent = job.data.text;
          break;
        case 'delete-vectors':
          // In real implementation, delete from Pinecone based on metadata tag
          return; 
      }

      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No extractable text found in document');
      }

      // Update DB with extracted content
      await this.prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: { content: textContent }
      });

      // Pass to RAG service for chunking and embedding
      await this.ragService.ingestDocument(organizationId, textContent, { docId: documentId });

      await this.updateStatus(documentId, 'COMPLETED');
      
      return { success: true };

    } catch (error: any) {
      console.error(`Processing failed for document ${documentId}:`, error);
      await this.prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: { status: 'FAILED', error: error.message }
      });
      throw error; // triggers BullMQ retry logic
    }
  }

  private async parseFile(base64Buffer: string, type: string): Promise<string> {
    const buffer = Buffer.from(base64Buffer, 'base64');
    
    if (type === 'PDF') {
      const data = await (pdfParse as any)(buffer);
      return data.text;
    } 
    
    if (type === 'DOCX') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    // EXCEL parsing logic would go here using sheetjs
    throw new Error(`Unsupported file type for parsing: ${type}`);
  }

  private async scrapeUrl(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(data);
      // Remove scripts, styles, navs
      $('script, style, nav, header, footer').remove();
      return $('body').text().replace(/\s+/g, ' ').trim();
    } catch (error) {
      throw new Error(`Failed to scrape URL: ${url}`);
    }
  }

  private async updateStatus(id: string, status: 'PROCESSING' | 'COMPLETED' | 'FAILED') {
    await this.prisma.knowledgeDocument.update({
      where: { id },
      data: { status }
    });
  }
}
