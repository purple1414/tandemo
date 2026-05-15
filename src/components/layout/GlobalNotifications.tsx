"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function GlobalNotifications({ align = "right" }: { align?: "left" | "right" }) {
  const items = useFinanceStore((state) => state.automations);
  const setGlobalTriggerId = useFinanceStore((state) => state.setGlobalTriggerId);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const notifications = items.filter(item => {
    const timeDiff = new Date(item.nextDate).getTime() - new Date().getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysUntil <= 3;
  }).sort((a,b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2.5 bg-muted/50 rounded-xl hover:bg-muted transition-all relative group border border-border/50"
      >
        <Bell className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-background animate-pulse" />
        )}
      </button>
      
      {isOpen && (
         <>
           <div className="fixed inset-0 z-[115]" onClick={() => setIsOpen(false)} />
           <div className={cn(
             "absolute mt-4 w-72 rounded-[2rem] p-6 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] border border-border/50 z-[120] animate-in slide-in-from-top-2 duration-300 overflow-hidden bg-white",
             align === "right" ? "right-0" : "left-0 md:left-full md:ml-4"
           )}>
             <div className="flex items-center justify-between mb-4 text-left">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Global Alerts</h4>
               <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-full uppercase">{notifications.length} New</span>
             </div>
             
             <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 -mr-1 custom-scrollbar text-left">
               {notifications.map(n => (
                 <button 
                   key={n.id}
                   onClick={() => {
                     setGlobalTriggerId(n.id);
                     setIsOpen(false);
                     router.push('/recurring');
                   }}
                   className="w-full text-left p-4 rounded-2xl bg-muted/30 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group/notif"
                 >
                   <div className="flex justify-between items-start mb-1">
                     <p className="text-[11px] font-black text-slate-900 group-hover/notif:text-primary transition-colors truncate max-w-[140px]">{n.name}</p>
                     <p className="text-[8px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md uppercase">Action</p>
                   </div>
                   <p className="text-[9px] font-bold text-slate-500 leading-relaxed">
                     ₱{n.amount.toLocaleString()} is {new Date(n.nextDate).getTime() < Date.now() ? 'overdue' : 'due soon'}
                   </p>
                 </button>
               ))}
               {notifications.length === 0 && (
                 <div className="text-center py-8">
                   <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
                     <CheckCircle2 className="w-6 h-6 text-muted-foreground/30" />
                   </div>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">All caught up!</p>
                 </div>
               )}
             </div>
           </div>
         </>
      )}
    </div>
  );
}
