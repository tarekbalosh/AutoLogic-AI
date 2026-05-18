'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MessageSquare, Bot, Users, Settings, 
  ChevronLeft, ChevronRight, LogOut, Search, Bell, Menu, X
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Conversations', icon: MessageSquare, href: '/dashboard/conversations' },
  { name: 'Live Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { name: 'Analytics', icon: LayoutDashboard, href: '/dashboard/analytics' },
  { name: 'Knowledge Base', icon: Bot, href: '/dashboard/knowledge' },
];

const bottomItems = [
  { name: 'Team', icon: Users, href: '/dashboard/team' },
  { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

function SidebarContent({ 
  isCollapsed, 
  user, 
  logout, 
  pathname, 
  onCloseItem 
}: { 
  isCollapsed: boolean; 
  user: any; 
  logout: () => void; 
  pathname: string;
  onCloseItem?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} onClick={onCloseItem}>
              <div
                className={`relative flex items-center px-3 py-3 rounded-xl transition-all cursor-pointer group
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0 z-10" />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 font-medium z-10 whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}

        <div className="my-6 border-t border-border" />

        {bottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} onClick={onCloseItem}>
              <div
                className={`relative flex items-center px-3 py-3 rounded-xl transition-all cursor-pointer group
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0 z-10" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 font-medium z-10 whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3 flex-1 overflow-hidden"
              >
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex bg-card border-r border-border h-screen flex-col relative z-20 shrink-0"
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-primary text-white p-1 rounded-full shadow-lg z-30 hover:bg-primary/90 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shrink-0">
            A
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 font-bold text-xl tracking-tight"
              >
                AutoLogic AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <SidebarContent 
          isCollapsed={isCollapsed} 
          user={user} 
          logout={logout} 
          pathname={pathname} 
        />
      </motion.aside>

      {/* 2. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border h-screen flex flex-col z-50 lg:hidden"
            >
              {/* Logo and Close Button */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-border">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shrink-0">
                    A
                  </div>
                  <span className="ml-3 font-bold text-xl tracking-tight">AutoLogic AI</span>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <SidebarContent 
                isCollapsed={false} 
                user={user} 
                logout={logout} 
                pathname={pathname} 
                onCloseItem={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search conversations, clients..." 
            className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <button className="relative p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
