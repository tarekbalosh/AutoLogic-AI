'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Zap, Shield, BarChart, Globe, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { ChatWidget } from '@/components/ChatWidget';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[140px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-10 py-6 max-w-7xl mx-auto backdrop-blur-xl border border-white/5 rounded-3xl sticky top-4 mt-4 z-50 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group cursor-pointer hover:rotate-3 transition-all">
            <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            AutoLogic <span className="text-indigo-400">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-black text-slate-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all shadow-xl">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-40 px-8 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-10 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Powered by Llama 3.3 Versatile
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-[8rem] lg:text-[10rem] font-black mb-10 leading-[0.85] tracking-[-0.05em] text-white"
        >
          <strong>
            Automate Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
              Desk.
            </span>
          </strong>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium px-4"
        >
          AutoLogic AI is the enterprise-grade support engine built for the next decade. 
          Respond in milliseconds, not hours. Automate 90% of your global support desk.
        </motion.p>
 
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/register" className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-indigo-500 hover:shadow-[0_10px_50px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-3 group shadow-2xl">
            Launch Platform <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <button className="w-full sm:w-auto px-12 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] font-black text-xl text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md">
            <Play className="w-5 h-5 fill-current text-indigo-400" /> Watch Story
          </button>
        </motion.div>
      </header>

      {/* Social Proof */}
      <section className="px-8 max-w-7xl mx-auto text-center py-10 opacity-30 grayscale pointer-events-none mb-24 md:mb-40">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-slate-500">Trusted by Global Enterprises</p>
         <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-20 text-xl sm:text-3xl font-black tracking-tighter text-slate-400">
            <span>VELOCITY</span>
            <span>HYPERION</span>
            <span>AETHER</span>
            <span>QUANTUM</span>
            <span>LUMINA</span>
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-40 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-[0.95] text-white">
                Train your AI <br />
                on your own <br />
                <span className="text-indigo-500 text-opacity-80">company data.</span>
              </h2>
              <div className="space-y-10">
                <FeatureItem 
                  title="Zero-Knowledge Ingestion" 
                  desc="Upload PDFs, DOCX, or Excel files. Our RAG engine builds a semantic index in under 60 seconds." 
                />
                <FeatureItem 
                  title="Dynamic Site Scraping" 
                  desc="Just paste your documentation URL. AutoLogic AI auto-scrapes and keeps its knowledge updated." 
                />
                <FeatureItem 
                  title="Multi-Channel Brain" 
                  desc="Deploy your brain across WhatsApp, Web, and Telegram with a single click. Unified context everywhere." 
                />
              </div>
            </div>
            <div className="relative group">
               <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-700" />
               <div className="bg-[#0F172A] border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-square flex items-center justify-center relative z-10">
                  <div className="w-full h-full bg-slate-900/50 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center text-center p-6 sm:p-12 border border-white/5">
                     <div className="relative mb-10">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                        <Bot className="w-24 h-24 text-indigo-400 relative z-10 animate-bounce" />
                     </div>
                     <h3 className="text-3xl font-black mb-4 text-white">Analyzing Data...</h3>
                     <p className="text-slate-500 text-sm mb-8 font-medium">Processing semantic embeddings for your knowledge base.</p>
                     <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ x: [-256, 256] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" 
                        />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 py-40">
        <StatItem val="99.9%" label="Uptime SLA" />
        <StatItem val="150ms" label="Latency" />
        <StatItem val="92%" label="Resolution" />
        <StatItem val="1.2M" label="Messages/mo" />
      </section>

      {/* CTA Section */}
      <section id="pricing" className="px-4 sm:px-8 py-20 md:py-40 max-w-6xl mx-auto text-center">
         <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-8 sm:p-16 md:p-24 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
            
            <h2 className="text-3xl sm:text-6xl md:text-8xl font-black mb-10 relative z-10 tracking-tighter">Ready to scale?</h2>
            <p className="text-base sm:text-xl text-indigo-100 mb-16 max-w-2xl mx-auto relative z-10 font-medium leading-relaxed">
               Join the elite teams delivering the next generation of customer support with AutoLogic AI.
            </p>
            <Link href="/register" className="bg-white text-indigo-600 px-8 py-4 sm:px-14 sm:py-6 rounded-xl sm:rounded-[2rem] font-black text-lg sm:text-2xl hover:scale-105 hover:shadow-2xl transition-all relative z-10 inline-block">
              Start Free Trial
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-24 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-500" />
          <span className="font-black text-2xl tracking-tighter text-white">AutoLogic AI</span>
        </div>
        <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">
          © 2026 AutoLogic AI Technologies. All rights reserved.
        </div>
        <div className="flex gap-10 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
        </div>
      </footer>
      
      <ChatWidgetWrapper />
    </div>
  );
}

function ChatWidgetWrapper() {
  const [convId, setConvId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setConvId(`conv-demo-${Math.random().toString(36).substring(7)}`);
  }, []);

  if (!convId) return null;

  return <ChatWidget organizationId="demo-org-1" conversationId={convId} />;
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="mt-1">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all duration-300">
          <CheckCircle2 className="w-6 h-6 text-indigo-500" />
        </div>
      </div>
      <div>
        <h4 className="font-black text-2xl mb-2 text-white group-hover:text-indigo-400 transition-colors">{title}</h4>
        <p className="text-slate-400 text-base leading-relaxed max-w-md">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ val, label }: { val: string, label: string }) {
  return (
    <div className="text-center group">
      <div className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white group-hover:text-indigo-400 transition-colors duration-500">{val}</div>
      <div className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em]">{label}</div>
    </div>
  );
}
