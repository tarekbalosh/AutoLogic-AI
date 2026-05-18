'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Globe, Plus, Trash2, Search, CheckCircle, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import axios from 'axios';

interface Document {
  id: string;
  title: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  sizeBytes: number;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [testQuestion, setTestQuestion] = useState('');
  const [testAnswer, setTestAnswer] = useState('');
  
  const { user } = useAuth();
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Simple mock for token
  });

  // Mock fetch documents
  useEffect(() => {
    // In a real app, fetch from /knowledge/list
    setDocuments([
      { id: '1', title: 'Company_Policies_2026.pdf', type: 'PDF', status: 'COMPLETED', sizeBytes: 2450000, createdAt: new Date().toISOString() },
      { id: '2', title: 'https://support.acme.com/billing', type: 'URL', status: 'PROCESSING', sizeBytes: 12000, createdAt: new Date().toISOString() },
      { id: '3', title: 'FAQ: Return Policy', type: 'MANUAL_FAQ', status: 'COMPLETED', sizeBytes: 500, createdAt: new Date().toISOString() },
    ]);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Mock progress
      const newDoc: Document = {
        id: Date.now().toString(),
        title: file.name,
        type: file.name.endsWith('pdf') ? 'PDF' : 'DOCX',
        status: 'PENDING',
        sizeBytes: file.size,
        createdAt: new Date().toISOString()
      };
      setDocuments(prev => [newDoc, ...prev]);

      // await api.post('/knowledge/upload', formData);
      
      // Simulate completion after delay
      setTimeout(() => {
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'COMPLETED' } : d));
      }, 3000);

    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    
    const newDoc: Document = {
      id: Date.now().toString(),
      title: urlInput,
      type: 'URL',
      status: 'PENDING',
      sizeBytes: 0,
      createdAt: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
    setUrlInput('');
    
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'COMPLETED' } : d));
    }, 2000);
  };

  const handleTestAI = async () => {
    setTestAnswer('Thinking...');
    setTimeout(() => {
      setTestAnswer(`Based on your training data, the answer to "${testQuestion}" is: We process refunds within 3-5 business days.`);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PROCESSING': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'FAILED': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">AI Knowledge Base</h1>
        <p className="text-muted-foreground">Train your support AI by uploading documents, scraping URLs, or adding FAQs.</p>
      </header>

      {/* Storage Quota Bar */}
      <div className="bg-card border border-border p-6 rounded-2xl mb-8 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-semibold mb-1">Storage Usage</h3>
            <p className="text-sm text-muted-foreground">Pro Plan Limit: 500 MB</p>
          </div>
          <span className="text-primary font-bold">2.4 MB / 500 MB (0.5%)</span>
        </div>
        <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-secondary h-full w-[0.5%]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Uploads */}
        <div className="col-span-2 space-y-8">
          
          {/* Upload Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:bg-muted hover:border-primary transition-all cursor-pointer relative bg-card shadow-sm">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                accept=".pdf,.docx,.xlsx"
                disabled={uploading}
              />
              <UploadCloud className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-1">Upload Documents</h3>
              <p className="text-xs text-muted-foreground">PDF, DOCX, Excel (Max 10MB)</p>
            </div>

            {/* URL Scraper */}
            <div className="bg-card border border-border shadow-sm rounded-2xl p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-secondary" />
                <h3 className="font-bold">Scrape Website</h3>
              </div>
              <form onSubmit={handleAddUrl} className="flex gap-2">
                <input 
                  type="url" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/docs" 
                  className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <button type="submit" className="bg-primary px-4 py-2 rounded-xl text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30">
              <h3 className="font-bold">Trained Documents</h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search files..." className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48 lg:w-64" />
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-foreground shrink-0">
                      {doc.type === 'URL' ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate break-all pr-2" title={doc.title}>{doc.title}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                        {doc.type} • {(doc.sizeBytes / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm text-muted-foreground capitalize">{doc.status.toLowerCase()}</span>
                    </div>
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Testing */}
        <div className="bg-card border border-border shadow-sm p-6 rounded-2xl h-fit">
          <div className="flex items-center gap-3 mb-6">
            <PlayCircle className="w-6 h-6 text-green-500" />
            <h3 className="font-bold text-xl">Test Training Quality</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Ask a question to see how the AI responds using only your uploaded documents.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Your Question</label>
              <textarea 
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500/50 min-h-[100px] text-sm resize-none"
                placeholder="e.g., What is the refund policy?"
              />
            </div>
            <button 
              onClick={handleTestAI}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-sm"
            >
              Ask AI
            </button>
            
            {testAnswer && (
              <div className="mt-6 p-4 bg-muted rounded-xl border border-border">
                <p className="text-sm font-bold text-primary mb-2">AI Response:</p>
                <p className="text-sm leading-relaxed text-foreground">{testAnswer}</p>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">Source: Company_Policies_2026.pdf (98% match)</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
