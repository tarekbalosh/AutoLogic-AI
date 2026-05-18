import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatEvent, SendMessageDto } from '@ai-support-hub/shared';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @Inject(JwtService) private jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (token) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'fallback-secret-change-me' });
        client.data.user = payload;
        
        if (payload.orgId) {
          client.join(`org_${payload.orgId}`);
        }
      }
    } catch (e) {
      client.data.user = { role: 'GUEST' };
    }
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    client.join(`conv_${conversationId}`);
    return { event: 'joined', data: conversationId };
  }

  @SubscribeMessage(ChatEvent.SEND_MESSAGE)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto
  ) {
    try {
      const senderId = client.data.user?.sub || 'guest';
      const isAi = client.data.user?.role === 'AI';

      const savedMessage = await this.chatService.saveMessage(payload, senderId, isAi);

      // Broadcast to everyone in the conversation room
      this.server.to(`conv_${payload.conversationId}`).emit(ChatEvent.RECEIVE_MESSAGE, savedMessage);
      
      // Emit delivery confirmation back to sender
      client.emit(ChatEvent.MESSAGE_READ, { messageId: savedMessage.id, status: 'DELIVERED' });

      // FALLBACK: If it's a customer message, and we don't have Redis, generate direct AI response
      if (!isAi) {
        // We'll simulate the AI thinking
        this.server.to(`conv_${payload.conversationId}`).emit(ChatEvent.TYPING_START, { userId: 'AI_AGENT' });
        
        try {
          const aiResponse = await this.chatService.generateDirectResponse(
            payload.conversationId, 
            payload.content, 
            client.data.user?.orgId || 'demo-org'
          );

          // Simulate slight delay for realism
          setTimeout(() => {
            this.server.to(`conv_${payload.conversationId}`).emit(ChatEvent.RECEIVE_MESSAGE, aiResponse);
            this.server.to(`conv_${payload.conversationId}`).emit(ChatEvent.TYPING_STOP, { userId: 'AI_AGENT' });
          }, 1000);
          
        } catch (error) {
          this.logger.error('Failed to generate AI response in gateway fallback', error);
          this.server.to(`conv_${payload.conversationId}`).emit('system:message', { 
            content: 'AI Assistant is currently offline. Please check your API keys.' 
          });
          this.server.to(`conv_${payload.conversationId}`).emit(ChatEvent.TYPING_STOP, { userId: 'AI_AGENT' });
        }
      }

      return { status: 'success' };
    } catch (error: any) {
      this.logger.error('Error handling message in gateway', error);
      client.emit(ChatEvent.ERROR, { message: error.message });
      return { status: 'error', error: error.message };
    }
  }

  @SubscribeMessage(ChatEvent.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    client.to(`conv_${conversationId}`).emit(ChatEvent.TYPING_START, { userId: client.data.user?.sub });
  }

  @SubscribeMessage(ChatEvent.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    client.to(`conv_${conversationId}`).emit(ChatEvent.TYPING_STOP, { userId: client.data.user?.sub });
  }

  @SubscribeMessage(ChatEvent.HANDOFF_REQUEST)
  async handleHandoff(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string
  ) {
    try {
      const result = await this.chatService.requestHandoff(conversationId);
      if (result) {
        this.server.to(`org_${result.conversation.organizationId}`).emit(ChatEvent.CONVERSATION_TRANSFER, {
          conversationId,
          assignedTo: result.assignedAgent.id
        });
        
        this.server.to(`conv_${conversationId}`).emit('system:message', {
          content: 'An agent will be with you shortly.'
        });
      }
    } catch (error: any) {
      client.emit(ChatEvent.ERROR, { message: 'Failed to request handoff' });
    }
  }
}
