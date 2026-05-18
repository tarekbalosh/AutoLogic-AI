'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, Link2, CreditCard, Users, 
  Save, Shield, Bell, Smartphone, Globe, Info,
  CheckCircle2, AlertCircle, Copy, ExternalLink
} from 'lucide-react';

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'company', name: 'Company', icon: Building2 },
  { id: 'ai', name: 'AI Configuration', icon: Shield },
  { id: 'integrations', name: 'Integrations', icon: Link2 },
  { id: 'billing', name: 'Billing & Plan', icon: CreditCard },
  { id: 'team', name: 'Team Management', icon: Users },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('integrations');

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account, company preferences, and active integrations.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Tabs sidebar */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 md:space-y-1 w-full md:w-64 shrink-0 snap-x scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm whitespace-nowrap shrink-0 snap-align-start md:w-full
                ${activeTab === tab.id 
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 md:p-8"
            >
              {activeTab === 'ai' && <AISettings />}
              {activeTab === 'integrations' && <IntegrationsSettings />}
              {activeTab === 'billing' && <BillingSettings />}
              {activeTab === 'profile' && <div className="text-center py-20 text-muted-foreground">Profile Settings Content</div>}
              {activeTab === 'company' && <div className="text-center py-20 text-muted-foreground">Company Settings Content</div>}
              {activeTab === 'team' && <div className="text-center py-20 text-muted-foreground">Team Management Content</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-1">External Channels</h3>
        <p className="text-sm text-muted-foreground">Connect your AI to external messaging platforms.</p>
      </div>

      <div className="space-y-4">
        {/* WhatsApp Integration Card */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Smartphone className="w-20 h-20" />
          </div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">WhatsApp Business API</h4>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Connected</span>
                </div>
              </div>
            </div>
            <button className="text-xs font-bold text-destructive hover:underline">Disconnect</button>
          </div>

          <div className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Phone Number ID</label>
                 <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono flex justify-between items-center text-slate-800 shadow-sm">
                   10928347209384
                   <Copy className="w-3 h-3 cursor-pointer hover:text-[#6366F1]" />
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">WABA ID</label>
                 <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono flex justify-between items-center text-slate-800 shadow-sm">
                   8827394850123
                   <Copy className="w-3 h-3 cursor-pointer hover:text-[#6366F1]" />
                 </div>
               </div>
             </div>
             <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Webhook URL</label>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono flex justify-between items-center text-slate-800 shadow-sm">
                  https://api.autologicai.com/webhooks/whatsapp
                  <Copy className="w-3 h-3 cursor-pointer hover:text-[#6366F1]" />
                </div>
             </div>
          </div>
        </div>

        {/* Telegram - Coming Soon */}
        <div className="border border-border rounded-2xl p-6 bg-muted/10 opacity-60">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center text-white">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Telegram Bot</h4>
                <p className="text-xs text-muted-foreground italic">Coming soon to Pro & Enterprise</p>
              </div>
            </div>
            <button className="bg-muted text-muted-foreground px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed">Install</button>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
        <button className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#6366F1] text-white hover:bg-[#6366F1]/90 transition-all shadow-lg shadow-indigo-500/20">Save Changes</button>
      </div>
    </div>
  );
}

function BillingSettings() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (priceId: string) => {
    setLoading(priceId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Upgrade failed', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h3 className="text-xl font-bold mb-1">Your Subscription</h3>
        <p className="text-sm text-muted-foreground">Manage your billing cycle and subscription tier.</p>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#6366F1] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
              <Shield className="w-8 h-8" />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-black italic tracking-tighter text-slate-800">FREE PLAN</h4>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">CURRENT</span>
              </div>
              <p className="text-sm text-slate-500">Limited to 500 AI messages / month.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PlanCard 
          name="Pro Plan" 
          price="$49" 
          features={['50,000 Messages', '10 Team Seats', 'WhatsApp API', 'Analytics']}
          onUpgrade={() => handleUpgrade('price_pro_id')}
          loading={loading === 'price_pro_id'}
        />
        <PlanCard 
          name="Enterprise" 
          price="Custom" 
          features={['Unlimited Messages', 'Unlimited Seats', 'Custom RAG', 'Dedicated Support']}
          onUpgrade={() => handleUpgrade('price_ent_id')}
          loading={loading === 'price_ent_id'}
          accent
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Invoices</h4>
        <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
          No invoices found. Start a subscription to see your billing history.
        </div>
      </div>
    </div>
  );
}

function PlanCard({ name, price, features, onUpgrade, loading, accent }: any) {
  return (
    <div className={`border rounded-2xl p-6 flex flex-col ${accent ? 'border-[#6366F1] bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
      <h4 className="font-bold mb-1 text-slate-800">{name}</h4>
      <div className="flex items-end gap-1 mb-6 text-slate-800">
        <span className="text-3xl font-black">{price}</span>
        {price !== 'Custom' && <span className="text-sm text-slate-500 mb-1">/mo</span>}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6366F1]" /> {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onUpgrade}
        disabled={loading}
        className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm
          ${accent ? 'bg-[#6366F1] text-white hover:bg-[#6366F1]/90 shadow-indigo-500/10' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}
        `}
      >
        {loading ? 'Processing...' : 'Upgrade Now'}
      </button>
    </div>
  );
}
function AISettings() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [config, setConfig] = useState({
    openaiApiKey: '',
    groqApiKey: '',
    aiPersonality: 'Professional, friendly, and helpful AI assistant.',
    aiGuardrails: 'Do not discuss competitors. Do not provide medical advice.',
    aiLanguage: 'Arabic'
  });

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organization/settings`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        setStatus({ type: 'success', message: 'AI configuration saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error saving AI settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-1">AI Engine Configuration</h3>
        <p className="text-sm text-muted-foreground">Configure your AI provider keys and personality.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          status.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-bold flex items-center gap-2 text-slate-800">
            <Globe className="w-4 h-4 text-[#6366F1]" />
            Provider API Keys
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Groq API Key (Recommended)</label>
              <input 
                type="password"
                placeholder="gsk_..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-800"
                value={config.groqApiKey}
                onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">OpenAI API Key</label>
              <input 
                type="password"
                placeholder="sk-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-800"
                value={config.openaiApiKey}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">AI Personality</label>
          <textarea 
            rows={3}
            placeholder="Describe how your AI should behave..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-slate-800"
            value={config.aiPersonality}
            onChange={(e) => setConfig({ ...config, aiPersonality: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800">Guardrails & Instructions</label>
          <textarea 
            rows={3}
            placeholder="Important rules the AI must follow..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-slate-800"
            value={config.aiGuardrails}
            onChange={(e) => setConfig({ ...config, aiGuardrails: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#6366F1] text-white hover:bg-[#6366F1]/90 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save AI Configuration'}
        </button>
      </div>
    </div>
  );
}
