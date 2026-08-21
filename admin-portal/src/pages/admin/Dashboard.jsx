import React, { useEffect, useState } from 'react';
import { Users, Building2, Briefcase, TrendingUp, ShieldCheck, Activity, ChevronRight, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, companies: 0, totalRevenue: 0, revenueData: [], subscriptionData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats`);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Premium Header Container */}
      <div className="relative rounded-[32px] bg-slate-900 p-10 text-white shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-700" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md mb-2">
             <Activity size={12} className="text-indigo-400" />
             <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Platform Telemetry</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">System Overview</h1>
          <p className="text-base text-slate-400 font-medium max-w-xl">Real-time intelligence and administrative audit telemetry for infrastructure health monitoring.</p>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: loading ? '...' : `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },
          { label: 'Total Users', value: loading ? '...' : stats.users, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
          { label: 'Job Inventory', value: loading ? '...' : stats.jobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
          { label: 'Organizations', value: loading ? '...' : stats.companies, color: 'text-violet-600', bg: 'bg-violet-50', icon: Building2, border: 'hover:border-violet-200' }
        ].map((stat, i) => (
          <Card key={i} className={`rounded-[32px] border-slate-200/60 shadow-sm bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${stat.border}`}>
            <CardContent className="p-8 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-slate-50 rounded-full opacity-50" />
              <div className="flex flex-col gap-5 relative z-10">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl border border-white shadow-sm flex items-center justify-center`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className={`text-4xl font-black tracking-tight tabular-nums ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Section */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Revenue Line Chart */}
        <div className="flex-1 min-w-0">
          <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Growth</h2>
               </div>
               <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-tight">
                  Monthly Trajectory
               </div>
            </div>

            <div className="flex-1 min-h-[350px]">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Graph...</p>
                </div>
              ) : stats.revenueData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      dx={-10}
                    />
                    <RechartsTooltip 
                      cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      itemStyle={{ color: '#10b981', fontWeight: '900' }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      dot={{ r: 6, strokeWidth: 3, fill: '#fff' }} 
                      activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No revenue data available</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Subscription Pie Chart */}
        <div className="xl:w-[420px] flex flex-col gap-8">
           <section className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm flex flex-col flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  <PieChartIcon size={18} className="text-indigo-600" /> Subscription Distribution
                </h2>
              </div>
              
              <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
                {loading ? (
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Data...</p>
                ) : stats.subscriptionData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.subscriptionData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active subscriptions</p>
                )}
              </div>
           </section>
        </div>
      </div>

      {/* System Telemetry Section */}
      <div className="flex flex-col xl:flex-row gap-8 mt-8">
        {/* Audit Logs */}
        <div className="flex-1 min-w-0">
          <section className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <Activity size={18} className="text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Telemetry</h2>
               </div>
               <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-tight">
                  Live Audit
               </div>
            </div>

            <div className="space-y-4">
              {[
                { msg: 'Global system synchronization finalized', time: '12:30 PM', status: 'SUCCESS' },
                { msg: 'Administrative session authorized: Root Admin', time: '11:45 AM', status: 'SECURITY' },
                { msg: 'Relational database integrity verified', time: '10:15 AM', status: 'STABLE' },
                { msg: 'New organization registration request: TechCorp', time: '09:30 AM', status: 'PENDING' },
                { msg: 'Automated backup sequence initiated', time: '08:00 AM', status: 'SYSTEM' },
              ].map((log, i) => (
                <div key={i} className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between group border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                       <ShieldCheck size={16} className="text-slate-400" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-800">{log.msg}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{log.time}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-md border ${
                    log.status === 'SECURITY' ? 'bg-red-50 text-red-600 border-red-100' : 
                    log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-6 text-emerald-600 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50 rounded-xl">
               Access Full Audit History <ChevronRight size={14} className="ml-1" />
            </Button>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="xl:w-[380px] flex flex-col gap-8">
            <Card className="rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 relative overflow-hidden group h-64 flex flex-col justify-end shadow-2xl shadow-slate-900/10 border-none hover:-translate-y-1 transition-transform duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
                 <TrendingUp size={120} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-80" />
              <div className="relative z-10 space-y-4">
                 <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl backdrop-blur-md">Platform Integrity</Badge>
                 <h3 className="text-2xl font-black leading-tight tracking-tight">Infrastructure status is currently Optimal.</h3>
                 <div className="flex items-center gap-4 mt-6">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700/80 backdrop-blur-md shadow-sm" />
                       ))}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">99.99% Uptime</span>
                 </div>
              </div>
           </Card>

           <section className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12} /> Resource telemetry</h4>
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Compute capacity', val: 78, color: 'bg-indigo-500', bg: 'bg-indigo-100' },
                   { label: 'Storage metrics', val: 42, color: 'bg-emerald-500', bg: 'bg-emerald-100' },
                   { label: 'Network throughput', val: 12, color: 'bg-blue-400', bg: 'bg-blue-100' }
                 ].map((item, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                         <span>{item.label}</span>
                         <span className="text-slate-900 font-black">{item.val}%</span>
                      </div>
                      <div className={`h-2.5 ${item.bg} rounded-full overflow-hidden`}>
                         <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${item.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
