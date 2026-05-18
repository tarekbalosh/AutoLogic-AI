'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MoreVertical, Send, Paperclip, Smile, 
  User, Bot, ShieldCheck, Clock, Phone, Mail, MapPin,
  ExternalLink, ChevronRight, CheckCheck, UserCheck, ArrowLeft
} from 'lucide-react';

// Mock Data
const conversations = [
  { 
    id: '1', 
    customer: 'Sarah Ahmed', 
    lastMsg: 'How can I reset my password?', 
    time: '2m ago', 
    status: 'AI_HANDLING', 
    unread: 2,
    avatar: 'SA'
  },
  { 
    id: '2', 
    customer: 'John Smith', 
    lastMsg: 'Thank you for the help!', 
    time: '1h ago', 
    status: 'RESOLVED', 
    unread: 0,
    avatar: 'JS'
  },
  { 
    id: '3', 
    customer: 'Elena Rodriguez', 
    lastMsg: 'I need to speak with a human agent please.', 
    time: '5m ago', 
    status: 'WAITING_AGENT', 
    unread: 1,
    avatar: 'ER'
  },
];

const messages = [
  { id: '1', sender: 'customer', text: 'Hello, I have a question about my subscription.', time: '10:00 AM' },
  { id: '2', sender: 'ai', text: 'Hello Sarah! I can certainly help you with that. Which plan are you currently on?', time: '10:00 AM' },
  { id: '3', sender: 'customer', text: 'I am on the Pro plan but I want to upgrade.', time: '10:01 AM' },
  { id: '4', sender: 'ai', text: 'Great choice! To upgrade, you can go to Settings > Billing and select the Enterprise plan. Would you like me to walk you through it?', time: '10:01 AM' },
  { id: '5', sender: 'customer', text: 'Actually, I need to speak with a human agent please.', time: '10:05 AM' },
];

export default function LiveChatPage() {
  const [selectedId, setSelectedId] = useState('3');
  const [msgInput, setMsgInput] = useState('');
  const [isMobileListView, setIsMobileListView] = useState(true);

  const activeChat = conversations.find(c => c.id === selectedId);

  return (
    <div className="flex h-full bg-background overflow-hidden">
      
      {/* 1. Conversations List (Left Sidebar) */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col bg-card ${isMobileListView ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold mb-4 px-2">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-muted border-none rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-2 p-4 pb-2">
            {['All', 'Open', 'Waiting'].map(tab => (
              <button key={tab} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${tab === 'All' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-border'}`}>
                {tab}
              </button>
            ))}
          </div>
          
          <div className="mt-2">
            {conversations.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => {
                  setSelectedId(chat.id);
                  setIsMobileListView(false);
                }}
                className={`p-4 flex items-start gap-3 cursor-pointer transition-all border-l-4 ${
                  selectedId === chat.id 
                  ? 'bg-primary/5 border-primary' 
                  : 'border-transparent hover:bg-muted'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  {chat.avatar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate">{chat.customer}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMsg}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary text-[10px] flex items-center justify-center text-white font-bold">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Chat Interface (Center) */}
      <div className={`flex-1 flex flex-col bg-muted/20 ${!isMobileListView ? 'flex' : 'hidden md:flex'}`}>
        {/* Chat Header */}
        <div className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setIsMobileListView(true)}
              className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground transition-colors mr-1 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              {activeChat?.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">{activeChat?.customer}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold whitespace-nowrap">Live Now</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all">
              <UserCheck className="w-3.5 h-3.5" /> Take Over Chat
            </button>
            <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="bg-muted px-3 py-1 rounded-full text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Today, Oct 12</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-3 max-w-[70%] ${msg.sender === 'customer' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold
                  ${msg.sender === 'customer' ? 'bg-indigo-100 text-indigo-600' : 
                    msg.sender === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-primary text-white'}
                `}>
                  {msg.sender === 'customer' ? 'C' : msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : 'A'}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                    ${msg.sender === 'customer' 
                      ? 'bg-card text-foreground rounded-tl-none' 
                      : msg.sender === 'ai'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-primary text-white rounded-tr-none'}
                  `}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                    {msg.time} {msg.sender !== 'customer' && <CheckCheck className="w-3 h-3 text-primary" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {activeChat?.status === 'WAITING_AGENT' && (
            <div className="flex justify-center">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Customer requested a human agent 5 minutes ago
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-card border-t border-border">
          <div className="bg-muted rounded-2xl p-2 flex items-end gap-2 border border-transparent focus-within:border-primary/30 transition-all">
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea 
              rows={1}
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Type your message as an agent..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-2 resize-none max-h-32"
            />
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-2 px-1">
            <button className="text-[10px] font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">/pricing</button>
            <button className="text-[10px] font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">/reset-password</button>
            <button className="text-[10px] font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">/welcome</button>
          </div>
        </div>
      </div>

      {/* 3. Conversation Info (Right Sidebar) */}
      <div className="w-80 border-l border-border bg-card flex flex-col hidden xl:flex">
        <div className="p-6 text-center border-b border-border">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            {activeChat?.avatar}
          </div>
          <h2 className="text-xl font-bold mb-1">{activeChat?.customer}</h2>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-medium">
            <MapPin className="w-3 h-3" /> Dubai, UAE • 6:11 PM
          </div>
          <div className="mt-4 flex gap-2 justify-center">
             <button className="p-2 bg-muted rounded-xl hover:bg-border transition-colors"><Mail className="w-4 h-4" /></button>
             <button className="p-2 bg-muted rounded-xl hover:bg-border transition-colors"><Phone className="w-4 h-4" /></button>
             <button className="p-2 bg-muted rounded-xl hover:bg-border transition-colors"><ShieldCheck className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Customer Details</h4>
            <div className="space-y-3">
              <DetailRow label="Email" value="sarah.ahmed@example.com" />
              <DetailRow label="Phone" value="+971 50 123 4567" />
              <DetailRow label="Plan" value="Pro (Monthly)" isBadge />
              <DetailRow label="First Seen" value="Oct 12, 2024" />
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">AI Sentiment Analysis</h4>
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Current Mood</span>
                <span className="text-xs font-bold text-amber-500">Neutral / Frustrated</span>
              </div>
              <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[40%]" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 italic leading-relaxed">
                "Customer has asked for a human agent twice. Tone is formal but slightly impatient."
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Previous Interactions</h4>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="group p-3 rounded-xl border border-border hover:border-primary/30 cursor-pointer transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold">Issue #1240{i}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Resolved by AI in 45s</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isBadge }: { label: string, value: string, isBadge?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      {isBadge ? (
        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">{value}</span>
      ) : (
        <span className="text-xs font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}
