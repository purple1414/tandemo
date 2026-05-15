"use client";

import { useState } from "react";
import { X, CheckCircle2, History, ArrowRightCircle } from "lucide-react";
import { Allowance } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SettleAllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowance: Allowance | null;
  onConfirm: (id: string) => Promise<void>;
}

export function SettleAllowanceModal({ isOpen, onClose, allowance, onConfirm }: SettleAllowanceModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !allowance) return null;

  const remaining = Math.max(0, allowance.amount - allowance.spent);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(allowance.id);
      onClose();
    } catch (err) {
      console.error("Settlement failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-border/10">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Settle Strategy
              </h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Finalize Allowance & Archive</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <History className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50">Moving to Archive</p>
                <h3 className="font-bold text-lg">{allowance.name}</h3>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-500/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50 mb-1">Unspent Amount</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">₱{remaining.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Limit</p>
                <p className="font-bold text-sm opacity-40">₱{allowance.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-2xl">
            <p className="text-[10px] leading-relaxed text-muted-foreground font-bold uppercase tracking-wide text-center">
              This will move "{allowance.name}" to your history timeline and mark it as completed today.
            </p>
          </div>

          <button 
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? "Settling Strategy..." : "Finalize & Bank"}
            <ArrowRightCircle className={cn("w-6 h-6", submitting && "animate-spin")} />
          </button>
        </div>
      </div>
    </div>
  );
}
