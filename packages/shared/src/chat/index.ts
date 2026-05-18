import { z } from 'zod';

export enum ChatEvent {
  SEND_MESSAGE = 'message:send',
  RECEIVE_MESSAGE = 'message:received',
  MESSAGE_READ = 'message:read',
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
  AGENT_JOIN = 'agent:join',
  AGENT_LEAVE = 'agent:leave',
  CONVERSATION_TRANSFER = 'conversation:transfer',
  CONVERSATION_CLOSE = 'conversation:close',
  HANDOFF_REQUEST = 'handoff:request',
  ERROR = 'error'
}

export const SendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string | null;
  isAi: boolean;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: Date;
  fileUrl?: string;
}

export interface ChatRoom {
  id: string;
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  customerId: string;
  organizationId: string;
}
