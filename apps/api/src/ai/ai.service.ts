import { Injectable, Logger, Inject } from '@nestjs/common';
import { RagService } from './rag.service';
import OpenAI from 'openai';

interface AIConfig {
  organizationId: string;
  companyName: string;
  personality: string;
  guardrails: string;
  language: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  customApiKey?: string;
}

interface AIResult {
  response: string;
  tokensUsed: number;
  isHandoffRecommended: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(RagService) private readonly ragService: RagService,
  ) {}

  async generateResponse(
    content: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    config: AIConfig,
  ): Promise<AIResult> {
    const startTime = Date.now();
    this.logger.log(`Generating AI response for organization: ${config.organizationId}`);

    try {
      // 1. Retrieve RAG Context
      let context = '';
      try {
        context = await this.ragService.retrieveContext(config.organizationId, content, 5);
      } catch (err) {
        this.logger.warn(`Failed to retrieve context from RAG: ${err.message}`);
      }

      // 2. Determine credentials, endpoint, and model
      const apiKey = config.customApiKey || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      const isGroq = !config.customApiKey && !!process.env.GROQ_API_KEY;
      const baseURL = isGroq ? 'https://api.groq.com/openai/v1' : undefined;
      
      // Llama 3.3 70B is highly capable and fast on Groq
      const model = isGroq 
        ? 'llama-3.3-70b-versatile' 
        : (config.plan === 'ENTERPRISE' ? 'gpt-4o' : 'gpt-4o-mini');

      if (!apiKey) {
        throw new Error('AI Provider API key is not configured. Please set GROQ_API_KEY or OPENAI_API_KEY.');
      }

      // 3. Initialize OpenAI client dynamically (Groq uses the OpenAI SDK)
      const openai = new OpenAI({
        apiKey,
        baseURL,
      });

      // 4. Assemble system prompt
      const systemPrompt = `
You are the AI customer support assistant for **${config.companyName}**.
Your personality is: ${config.personality || 'Professional, friendly, and helpful.'}
Your primary goal is to help customers based on the retrieved knowledge base context.

## IDENTITY & TONE
- You consistently represent **${config.companyName}**. Keep this identity at all times.
- Be extremely professional, concise, and polite.
- Respond in the language requested by the customer (default: ${config.language || 'English'}).

## GUARDRAILS
- Guardrails: ${config.guardrails || 'Provide helpful information based only on the knowledge base.'}
- If you do not know the answer or the context does not contain the answer, politely say you don't know and offer to connect them to a human agent. Do not make up facts or links.
- Never mention internal database systems, technology stack, or details about Pinecone/Groq/OpenAI in your response.

## RETRIEVED CONTEXT FROM KNOWLEDGE BASE:
Use the following context to answer the user's question. If the context is empty, respond with general assistance or politely offer a human handoff.
<context>
${context || 'No specific knowledge base context is available.'}
</context>
`;

      // 5. Assemble messages
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content },
      ];

      // 6. Call LLM
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 800,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // 7. Determine handoff recommendation
      const handoffKeywords = [
        'human', 'agent', 'representative', 'support team', 'escalate', 'transfer', 
        'person', 'human assistant', 'live person', 'connect me',
        'أخصائي', 'عميل', 'بشري', 'تحويل', 'موظف', 'شخص حقيقي'
      ];
      const isHandoffRecommended = 
        handoffKeywords.some(kw => content.toLowerCase().includes(kw)) ||
        handoffKeywords.some(kw => responseText.toLowerCase().includes(kw)) ||
        responseText.toLowerCase().includes('connect you to a human') ||
        responseText.toLowerCase().includes('transfer you');

      this.logger.log(`AI Response generated in ${Date.now() - startTime}ms. Model used: ${model}. Tokens used: ${tokensUsed}`);

      return {
        response: responseText,
        tokensUsed,
        isHandoffRecommended,
      };

    } catch (error) {
      this.logger.error('Failed to generate AI response:', error);
      // Fail-safe default response
      return {
        response: "I apologize, but I am currently experiencing technical difficulties. Let me connect you with a human support agent.",
        tokensUsed: 0,
        isHandoffRecommended: true,
      };
    }
  }
}