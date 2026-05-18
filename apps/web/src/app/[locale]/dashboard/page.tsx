'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { MessageSquare, Bot, Clock, ArrowUpRight, ArrowDownRight, User, Settings } from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();
  
  const [greeting, setGreeting] = React.useState('Hello');
  
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{greeting}, {user?.name?.split(' ')[0] || 'Agent'}! 👋</h1>
          <p className="text-primary-foreground/80 text-sm sm:text-lg">Here's what's happening with your AI support today.</p>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Conversations" value="1,284" trend="+12.5%" isPositive={true} icon={MessageSquare} delay={0.1} />
        <KPICard title="AI Resolution Rate" value="84.2%" trend="+4.1%" isPositive={true} icon={Bot} delay={0.2} />
        <KPICard title="Avg Response Time" value="45s" trend="-15s" isPositive={true} icon={Clock} delay={0.3} />
        <KPICard title="Active Human Handoffs" value="12" trend="+2" isPositive={false} icon={User} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="col-span-2 bg-card border border-border rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-6 flex justify-between items-center">
            Recent Conversations
            <button className="text-sm text-primary hover:underline font-medium">View All</button>
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  C{i}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold truncate">Customer {i}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">2m ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">I need help resetting my password for my account...</p>
                </div>
                <div className="shrink-0 pl-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                    ${i % 2 === 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary'}
                  `}>
                    {i % 2 === 0 ? 'Resolved' : 'AI Handling'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionButton icon={Bot} title="Train AI Knowledge" desc="Upload new PDFs or URLs" href="/dashboard/knowledge" />
            <QuickActionButton icon={MessageSquare} title="View Live Chats" desc="Monitor active sessions" href="/dashboard/chat" />
            <QuickActionButton icon={Settings} title="WhatsApp Setup" desc="Configure Business API" href="/dashboard/settings/whatsapp" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon, delay }: any) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay } }
      }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className="absolute -right-4 -top-4 p-8 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-8 h-8 text-primary opacity-50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
      <div className="flex items-end gap-3 mb-1">
        <span className="text-3xl font-extrabold text-foreground tracking-tight">{value}</span>
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {trend} from last week
      </div>
    </motion.div>
  );
}

function QuickActionButton({ icon: Icon, title, desc, href }: any) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-muted group-hover:bg-primary group-hover:text-white flex items-center justify-center text-muted-foreground transition-colors shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
