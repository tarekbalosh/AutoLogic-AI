'use client';

import React, { useState } from 'react';
import { MessageCircle, Key, Link as LinkIcon, CheckCircle, Copy, AlertTriangle } from 'lucide-react';

export default function WhatsappSettingsPage() {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('wf_ai_support_2026'); // Example static token
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.supportflow.com'}/webhooks/whatsapp`;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('CONNECTING');
    
    // Mock API call to save credentials
    setTimeout(() => {
      setStatus('CONNECTED');
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-10 bg-[#0A0A0F] min-h-screen text-white max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-500" />
          WhatsApp Integration
        </h1>
        <p className="text-gray-400">Connect your WhatsApp Business API to deploy AI on your phone number.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Step 1: Webhook Config */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-sm flex items-center justify-center">1</span>
            Configure Meta Webhook
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Go to your Meta App Dashboard &gt; WhatsApp &gt; Configuration. Edit the webhook and paste these exact values:
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Callback URL</label>
              <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-white/10">
                <code className="text-sm text-green-400 flex-1 truncate">{webhookUrl}</code>
                <button onClick={() => copyToClipboard(webhookUrl)} className="text-gray-400 hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Verify Token</label>
              <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-white/10">
                <code className="text-sm text-blue-400 flex-1">{verifyToken}</code>
                <button onClick={() => copyToClipboard(verifyToken)} className="text-gray-400 hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-200">Don't forget to subscribe to the "messages" webhook field in your Meta dashboard after saving.</p>
          </div>
        </div>

        {/* Step 2: Credentials */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-sm flex items-center justify-center">2</span>
            Connect Credentials
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter the credentials from your Meta App to allow SupportFlow to send messages on your behalf.
          </p>

          <form onSubmit={handleConnect} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Phone Number ID
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="102345678901234"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 text-sm"
                required
                disabled={status === 'CONNECTED'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" /> Permanent Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAA..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 text-sm"
                required
                disabled={status === 'CONNECTED'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'CONNECTING' || status === 'CONNECTED'}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${status === 'CONNECTED' ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 
                  'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {status === 'IDLE' && 'Verify & Connect'}
              {status === 'CONNECTING' && 'Connecting...'}
              {status === 'CONNECTED' && <><CheckCircle className="w-5 h-5" /> Connected</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
