'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Clock, Star, Download, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

// Mock Data
const chartData = [
  { date: 'Mon', total: 120, aiResolved: 95 },
  { date: 'Tue', total: 150, aiResolved: 110 },
  { date: 'Wed', total: 180, aiResolved: 150 },
  { date: 'Thu', total: 140, aiResolved: 120 },
  { date: 'Fri', total: 200, aiResolved: 175 },
  { date: 'Sat', total: 90, aiResolved: 80 },
  { date: 'Sun', total: 85, aiResolved: 75 },
];

const outcomeData = [
  { name: 'AI Resolved', value: 75, color: '#8b5cf6' },
  { name: 'Agent Handled', value: 20, color: '#3b82f6' },
  { name: 'Unresolved', value: 5, color: '#ef4444' },
];

const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
  hour: `${i}:00`,
  volume: Math.floor(Math.random() * 50) + (i > 9 && i < 18 ? 50 : 10)
}));

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="p-4 sm:p-6 md:p-10 bg-[#0A0A0F] min-h-screen text-white">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500 shrink-0" />
            Analytics & Insights
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Track AI performance, agent efficiency, and customer satisfaction.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex justify-between sm:justify-start">
            {['today', '7d', '30d', '90d'].map((range) => (
              <button 
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-initial text-center ${
                  dateRange === range ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'today' ? 'Today' : `Last ${range}`}
              </button>
            ))}
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full sm:w-auto">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Conversations" value="965" trend="+12%" isPositive={true} icon={MessageSquareIcon} color="blue" />
        <KPICard title="AI Resolution Rate" value="83.4%" trend="+4.2%" isPositive={true} icon={BotIcon} color="purple" />
        <KPICard title="Avg Response Time" value="1.2s" trend="-0.4s" isPositive={true} icon={Clock} color="green" />
        <KPICard title="Customer Satisfaction" value="4.8/5" trend="+0.1" isPositive={true} icon={Star} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Main Chart */}
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-6">Conversation Volume vs AI Resolution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="Total Volume" />
                <Area type="monotone" dataKey="aiResolved" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAi)" name="AI Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold mb-6">Resolution Breakdown</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {outcomeData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hourly Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-6">Traffic Distribution (Hourly)</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="hour" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#ffffff10' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20', borderRadius: '12px' }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Leaderboard */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-6 flex justify-between items-center">
            Agent Performance
            <span className="text-xs font-normal text-purple-400 cursor-pointer hover:underline">View All</span>
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Sarah Connor', resolved: 142, csat: 4.9, avatar: 'S' },
              { name: 'John Smith', resolved: 128, csat: 4.7, avatar: 'J' },
              { name: 'Emily Davis', resolved: 95, csat: 4.5, avatar: 'E' },
            ].map((agent, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                    {agent.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.resolved} resolutions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-yellow-400 font-bold">
                    <Star className="w-3 h-3 fill-current" /> {agent.csat}
                  </div>
                  <p className="text-xs text-gray-500">CSAT Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents & Icons
const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const BotIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="10" x="3" y="11" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" x2="8" y1="16" y2="16"></line><line x1="16" x2="16" y1="16" y2="16"></line></svg>
);

function KPICard({ title, value, trend, isPositive, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    green: 'text-green-500 bg-green-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
        <Icon className="w-24 h-24" />
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold">{value}</span>
        <div className={`flex items-center gap-1 text-sm font-medium mb-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend}
        </div>
      </div>
    </div>
  );
}
