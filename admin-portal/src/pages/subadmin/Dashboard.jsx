import React from 'react';
import { CircleCheck, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SubAdminDashboard = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-orange-600 rounded-full" />
          <h1 className="text-3xl font-black text-foreground tracking-tight">Operational Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl border border-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none">Live Ops Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Moderation Queue */}
        <div className="lg:col-span-2">
          <Card className="rounded-[32px] border-border shadow-sm p-8 overflow-hidden group bg-card">
            <h2 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
              <Clock size={24} className="text-orange-600" /> Pending Moderations
            </h2>
            <div className="space-y-4">
              {[
                { title: 'New Job: Senior React Dev', time: '10 mins ago', type: 'Job' },
                { title: 'Company Update: TechNova Inc', time: '45 mins ago', type: 'Company' },
                { title: 'Reported User: bad_actor_123', time: '1 hour ago', type: 'User' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-muted/30 hover:bg-card rounded-[24px] border border-transparent hover:border-border transition-all duration-300 group/item hover:shadow-md">
                   <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground font-black text-xs">
                        {item.type[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-foreground group-hover/item:text-orange-600 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary" className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${item.type === 'Job' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-orange-50 text-orange-600 dark:bg-orange-950/30'} border-none hover:bg-opacity-100 transition-none`}>
                            {item.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.time}</span>
                        </div>
                      </div>
                   </div>
                   <Button variant="outline" size="sm" className="px-5 h-10 rounded-xl border-border text-xs font-black text-foreground hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm">
                     Review
                   </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Statistics Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-orange-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
             <div className="relative z-10">
               <h2 className="text-xl font-black mb-8 text-white">Performance Stats</h2>
               <div className="space-y-4">
                  <div className="p-5 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/10 flex items-center justify-between group-hover:bg-white/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-orange-600 shadow-lg">
                           <CircleCheck size={20} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-black text-white/90">Processed Items</span>
                     </div>
                     <span className="text-2xl font-black text-white">42</span>
                  </div>
                  <div className="p-5 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/10 flex items-center justify-between group-hover:bg-white/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-lg">
                           <AlertTriangle size={20} strokeWidth={3} />
                        </div>
                        <span className="text-sm font-black text-white/90">Escalated Logs</span>
                     </div>
                     <span className="text-2xl font-black text-white">03</span>
                  </div>
               </div>
             </div>
             {/* Decorative */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-[0.05] blur-[80px] rounded-full"></div>
          </div>

          <Card className="bg-card rounded-[32px] border-border shadow-sm p-8 flex flex-col items-center text-center gap-4 h-full relative group overflow-hidden">
             <CardContent className="p-0 flex flex-col items-center text-center gap-4">
               <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground border border-border mb-2 group-hover:scale-110 transition-transform">
                  <FileText size={40} strokeWidth={1} />
               </div>
               <p className="text-lg font-black text-foreground">Need Help?</p>
               <p className="text-sm font-bold text-muted-foreground">Read the operational guidelines for content moderation.</p>
               <Button variant="outline" className="mt-4 w-full py-6 rounded-2xl bg-muted/30 border-border text-xs font-black text-muted-foreground uppercase tracking-widest hover:bg-muted transition-all">
                  System Documentation
               </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;
