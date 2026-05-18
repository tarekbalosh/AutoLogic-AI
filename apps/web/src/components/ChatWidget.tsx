'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { ChatEvent, ChatMessage, SendMessageDto } from '@ai-support-hub/shared';
import { Send, Paperclip, X, Bot, User, Loader2 } from 'lucide-react';

interface WidgetProps {
  organizationId: string;
  conversationId: string; // Typically initialized via an API call before showing widget
}

export function ChatWidget({ organizationId, conversationId }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { emit, on, isConnected } = useSocket();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          conversationId,
          content: "Hello! I am Support AI. How can I help you today? Feel free to ask me anything about our services.",
          senderId: 'ai',
          isAi: true,
          status: 'SENT',
          createdAt: new Date(),
        }
      ]);
    }
  }, [conversationId, messages.length]);

  useEffect(() => {
    if (isConnected && isOpen) {
      emit('join:conversation', conversationId);
      
      const unsubscribeReceive = on(ChatEvent.RECEIVE_MESSAGE, (msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
      });

      const unsubscribeTypingStart = on(ChatEvent.TYPING_START, () => setIsTyping(true));
      const unsubscribeTypingStop = on(ChatEvent.TYPING_STOP, () => setIsTyping(false));

      return () => {
        unsubscribeReceive();
        unsubscribeTypingStart();
        unsubscribeTypingStop();
      };
    }
  }, [isConnected, isOpen, conversationId, emit, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  let typingTimeout: NodeJS.Timeout;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Typing indicator with debounce
    emit(ChatEvent.TYPING_START, conversationId);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      emit(ChatEvent.TYPING_STOP, conversationId);
    }, 1500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !file) return;

    let fileUrl = undefined;
    if (file) {
      // In reality, upload to S3 here and get URL
      fileUrl = URL.createObjectURL(file); // Mock
    }

    const payload: SendMessageDto = {
      conversationId,
      content: inputValue,
      fileUrl,
    };

    emit(ChatEvent.SEND_MESSAGE, payload);
    setInputValue('');
    setFile(null);
    emit(ChatEvent.TYPING_STOP, conversationId);
  };

  const requestHandoff = () => {
    emit(ChatEvent.HANDOFF_REQUEST, conversationId);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      conversationId,
      content: "I'd like to speak to a human.",
      senderId: 'me',
      isAi: false,
      status: 'SENT',
      createdAt: new Date()
    }]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {/* Premium Greeting Bubble */}
        <div className="relative group bg-[#18181B] border border-white/10 px-4 py-3 rounded-2xl text-xs text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] animate-bounce mb-2 max-w-[200px]">
          <div className="absolute -bottom-1 right-6 w-3 h-3 bg-[#18181B] rotate-45 border-r border-b border-white/10" />
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="font-bold">Hi! How can I help you today? 👋</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="relative group w-16 h-16 bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_50px_rgba(99,102,241,0.6)] transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden border border-white/20"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-indigo-500/40 -z-10" />
          <MessageSquare className="w-8 h-8 text-white drop-shadow-xl group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[650px] bg-[#09090B] border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="p-6 bg-[#18181B]/50 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#09090B] rounded-full" />
          </div>
          <div>
            <h3 className="font-black text-white tracking-tight">Support AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Online Now</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] rounded-[1.5rem] p-4 shadow-sm ${
              msg.isAi 
                ? 'bg-[#18181B] text-white border border-white/5 rounded-tl-none' 
                : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none shadow-indigo-500/20 shadow-lg'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.fileUrl && (
                <div className="mt-3 p-2 bg-black/20 rounded-lg text-xs flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="opacity-80">Attached Document</span>
                </div>
              )}
              <div className="text-[10px] opacity-40 mt-2 font-bold uppercase tracking-widest text-right" suppressHydrationWarning>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-[#18181B] border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-[#18181B]/30 backdrop-blur-md border-t border-white/5">
        {file && (
          <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-4 text-xs text-indigo-300 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/5 rounded-full"><X className="w-4 h-4" /></button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-white/5 p-2 pr-4 rounded-2xl border border-white/5 focus-within:border-indigo-500/50 transition-all">
          <label className="cursor-pointer p-2 text-gray-400 hover:text-indigo-400 transition-colors">
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Paperclip className="w-5 h-5" />
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Write your message..."
            className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-gray-600 font-medium"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() && !file}
            className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Add MessageSquare import locally
import { MessageSquare } from 'lucide-react';
