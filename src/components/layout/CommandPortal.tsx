"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, ChevronDown, Landmark, Wallet, BrainCircuit, ChevronRight, ChevronLeft } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { useModals } from "@/components/layout/ModalProvider";
import { cn } from "@/lib/utils";

export function CommandPortal() {
  const router = useRouter();
  const { allowances } = useFinanceStore();
  const { openTransactionModal, openAllowanceModal, openQuickDeductModal } = useModals();
  const [activeMenu, setActiveMenu] = useState<"main" | "allowance" | "selection" | null>(null);

  const activeAllowances = allowances.filter(al => al.status === "active");

  return (
    <>
      {/* GLOBAL FAB - MOBILE ONLY */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button 
          onClick={() => setActiveMenu(activeMenu ? null : "main")}
          className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-95 transition-all group"
        >
          <div className="w-6 h-6 flex items-center justify-center relative">
            <Plus className={cn("w-6 h-6 transition-transform duration-500 absolute", activeMenu && "scale-0 rotate-90")} />
            <MoreVertical className={cn("w-6 h-6 transition-transform duration-500 absolute scale-0", activeMenu && "scale-100 rotate-90")} />
          </div>
        </button>

        {activeMenu && (
          <>
            <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[-1]" onClick={() => setActiveMenu(null)} />
            <div className="absolute bottom-20 right-0 w-72 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 p-2">
              
              {/* MAIN MENU */}
              {activeMenu === "main" && (
                <div className="space-y-1">
                  <div className="px-5 py-4 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Command Portal</p>
                  </div>
                  <button onClick={() => { openTransactionModal(); setActiveMenu(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-left hover:bg-muted/50 group/item">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover/item:scale-110">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-muted-foreground group-hover/item:text-foreground">Add Transaction</span>
                  </button>
                  <button onClick={() => { router.push('/accounts'); setActiveMenu(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-left hover:bg-muted/50 group/item">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center transition-transform group-hover/item:scale-110">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-muted-foreground group-hover/item:text-foreground">Accounts</span>
                  </button>
                  <button onClick={() => setActiveMenu("allowance")} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-left hover:bg-muted/50 group/item">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center transition-transform group-hover/item:scale-110">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-muted-foreground group-hover/item:text-foreground">Allowance</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </button>
                </div>
              )}

              {/* ALLOWANCE SUB-MENU */}
              {activeMenu === "allowance" && (
                <div className="space-y-1">
                  <button onClick={() => setActiveMenu("main")} className="flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                  <div className="px-5 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Allowance Management</p>
                  </div>
                  <button onClick={() => { openAllowanceModal(); setActiveMenu(null); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-left hover:bg-muted/50 group/item">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-muted-foreground group-hover/item:text-foreground">Create New Allowance</span>
                  </button>
                  <button onClick={() => setActiveMenu("selection")} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all text-left hover:bg-muted/50 group/item">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-muted-foreground group-hover/item:text-foreground">Deduct / Add Allowance</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </button>
                </div>
              )}

              {/* SELECTION LIST */}
              {activeMenu === "selection" && (
                <div className="space-y-1">
                  <button onClick={() => setActiveMenu("allowance")} className="flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-indigo-500 transition-colors">
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                  <div className="px-5 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Select Active List</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                    {activeAllowances.map((al) => (
                      <button 
                        key={al.id} 
                        onClick={() => { openQuickDeductModal(al); setActiveMenu(null); }} 
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all text-left hover:bg-muted/50 group/al"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <span className="text-lg">💰</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate">{al.name}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Active • ₱{al.amount.toLocaleString()}</p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover/al:text-primary transition-colors" />
                      </button>
                    ))}
                    {activeAllowances.length === 0 && (
                      <p className="text-center py-6 text-[10px] text-muted-foreground uppercase tracking-widest">No Active Allowances</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
