import { Injectable, Logger } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private pinecone: any;
  private embeddings: OpenAIEmbeddings | null = null;
  private cohere: any;

  constructor() {
    // Lazy-init: only connect to external services if keys are configured
    try {
      if (process.env.PINECONE_API_KEY) {
        const { Pinecone } = require('@pinecone-database/pinecone');
        this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
      }
    } catch (e) {
      this.logger.warn('Pinecone not configured - RAG retrieval will return empty context');
    }

    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-...') {
        this.embeddings = new OpenAIEmbeddings({
          modelName: 'text-embedding-3-small',
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
      }
    } catch (e) {
      this.logger.warn('OpenAI Embeddings not configured');
    }

    try {
      if (process.env.COHERE_API_KEY) {
        const { CohereClient } = require('cohere-ai');
        this.cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
      }
    } catch (e) {
      this.logger.warn('Cohere not configured - reranking disabled');
    }
  }

  /**
   * Process a document into chunks and store in Vector DB
   */
  async ingestDocument(organizationId: string, text: string, metadata: Record<string, any>) {
    if (!this.pinecone || !this.embeddings) {
      this.logger.warn('Skipping document ingestion - vector DB not configured');
      return;
    }

    try {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ['\n\n', '\n', ' ', ''],
      });

      const docs = await splitter.createDocuments([text], [metadata]);
      
      const index = this.pinecone.Index(process.env.PINECONE_INDEX || 'supportflow-idx');
      
      const vectors = await Promise.all(docs.map(async (doc: any, i: number) => {
        const embedding = await this.embeddings!.embedQuery(doc.pageContent);
        return {
          id: `${organizationId}-${metadata.docId}-chunk-${i}`,
          values: embedding,
          metadata: {
            ...doc.metadata,
            organizationId,
            text: doc.pageContent,
          }
        };
      }));

      // Upsert in batches of 100
      for (let i = 0; i < vectors.length; i += 100) {
        await index.upsert(vectors.slice(i, i + 100) as any);
      }
      
      this.logger.log(`Ingested ${vectors.length} chunks for org ${organizationId}`);
    } catch (error) {
      this.logger.error('Failed to ingest document', error);
      throw error;
    }
  }

  /**
   * Hybrid retrieval (Semantic via Pinecone) + Reranking (Cohere)
   */
  async retrieveContext(organizationId: string, query: string, topK: number = 5): Promise<string> {
    if (!this.pinecone || !this.embeddings) {
      this.logger.warn('Vector DB not configured - returning empty context');
      return '';
    }

    try {
      const index = this.pinecone.Index(process.env.PINECONE_INDEX || 'supportflow-idx');
      
      // 1. Semantic Search
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 15, // Get more for reranking
        includeMetadata: true,
        filter: { organizationId: { $eq: organizationId } }
      });

      if (!searchResults.matches || searchResults.matches.length === 0) {
        return '';
      }

      const documents = searchResults.matches.map((m: any) => m.metadata?.text as string).filter(Boolean);

      // 2. Cohere Reranking (if available)
      if (this.cohere) {
        try {
          const rerankResponse = await this.cohere.rerank({
            model: 'rerank-multilingual-v3.0',
            query: query,
            documents: documents,
            topN: topK,
          });

          // 3. Assemble top contexts
          const rankedDocs = rerankResponse.results.map((r: any) => documents[r.index]);
          return rankedDocs.join('\n\n---\n\n');
        } catch (e) {
          this.logger.warn('Cohere reranking failed, returning unranked results');
        }
      }

      // Fallback: return top results without reranking
      return documents.slice(0, topK).join('\n\n---\n\n');
    } catch (error) {
      this.logger.error('Retrieval failed', error);
      // Fallback: return empty context if external services fail
      return '';
    }
  }
}
