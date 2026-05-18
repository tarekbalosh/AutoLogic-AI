'use client';

import React, { useState } from 'react';
import { Sidebar, TopHeader } from '@/components/layout/DashboardLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <TopHeader onMenuClick={() => setIsMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
