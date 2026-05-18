'use client';

import React from 'react';
import { DataTable } from '@/components/DataTable';
import { 
  UserPlus, 
  Shield, 
  MoreVertical, 
  Mail, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const teamData = [
  { id: '1', name: 'Sarah Connor', email: 'sarah@autologicai.com', role: 'Super Admin', status: 'Active', lastActive: '2m ago' },
  { id: '2', name: 'John Smith', email: 'john@autologicai.com', role: 'Agent', status: 'Active', lastActive: '1h ago' },
  { id: '3', name: 'Emily Davis', email: 'emily@autologicai.com', role: 'Agent', status: 'Offline', lastActive: '2d ago' },
  { id: '4', name: 'Michael Chen', email: 'michael@autologicai.com', role: 'Support Manager', status: 'Active', lastActive: '15m ago' },
  { id: '5', name: 'Aria Stark', email: 'aria@autologicai.com', role: 'Agent', status: 'Invited', lastActive: 'N/A' },
  { id: '6', name: 'Robb Stark', email: 'robb@autologicai.com', role: 'Agent', status: 'Active', lastActive: '5m ago' },
];

export default function TeamPage() {
  const columns = [
    { 
      header: 'Member', 
      accessor: 'name' as const,
      sortable: true,
      render: (val: string, item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {val.charAt(0)}
          </div>
          <div>
            <p className="font-bold">{val}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {item.email}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      accessor: 'role' as const,
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Shield className={`w-3.5 h-3.5 ${val === 'Super Admin' ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-xs font-medium">{val}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as const,
      sortable: true,
      render: (val: string) => (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit
          ${val === 'Active' ? 'bg-green-500/10 text-green-600' : 
            val === 'Invited' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}
        `}>
          <div className={`w-1.5 h-1.5 rounded-full ${val === 'Active' ? 'bg-green-500' : val === 'Invited' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
          {val}
        </div>
      )
    },
    { 
      header: 'Last Active', 
      accessor: 'lastActive' as const,
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Clock className="w-3.5 h-3.5" />
          {val}
        </div>
      )
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your support agents, their roles, and track their activity status.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0">
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <StatCard title="Active Agents" value="8" sub="2 currently in chat" color="blue" />
         <StatCard title="Avg Response Time" value="1m 12s" sub="-14% vs last week" color="indigo" />
         <StatCard title="Tickets Resolved" value="1,240" sub="+82 today" color="green" />
      </div>

      <DataTable 
        columns={columns} 
        data={teamData} 
        title="All Members"
        description="A list of all users within your organization."
        actions={(item) => (
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      />
    </div>
  );
}

function StatCard({ title, value, sub, color }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
       <h4 className="text-3xl font-black mb-1">{value}</h4>
       <p className="text-xs font-medium text-primary">{sub}</p>
    </div>
  );
}
