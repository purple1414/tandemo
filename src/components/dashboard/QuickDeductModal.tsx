"use client";

import { useState } from "react";
import { X, ArrowDownCircle, ArrowUpCircle, Settings } from "lucide-react";
import { useFinanceStore, Allowance } from "@/lib/store";
import { cn } from "@/lib/utils";

interface QuickDeductModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowance: Allowance | null;
  onOpenSettings: (al: Allowance) => void;
}

export function QuickDeductModal({ isOpen, onClose, allowance, onOpenSettings }: QuickDeductModalProps) {
  const { deductFromAllowance, addToAllowance } = useFinanceStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"deduct" | "add">("deduct");
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !allowance) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      setSubmitting(true);
      setError(null);
      try {
        if (mode === "deduct") {
          const remaining = allowance.amount - allowance.spent;
          if (val > remaining) {
            setError(`Exceeds remaining: ₱${remaining.toLocaleString()}`);
            setSubmitting(false);
            return;
          }
          await deductFromAllowance(allowance.id, val, description);
        } else {
          await addToAllowance(allowance.id, val, description);
        }
        setAmount("");
        setDescription("");
        setError(null);
        setMode("deduct");
        onClose();
      } catch (err: any) {
        setError("Synchronization failed.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">{allowance.name}</h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                {mode === "deduct" ? "Enter Expense Amount" : "Enter Top-up Amount"}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMode(mode === "deduct" ? "add" : "deduct")}
                className={cn(
                  "p-2 rounded-full transition-colors flex items-center justify-center",
                  mode === "add" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                )}
                title={mode === "deduct" ? "Switch to Top-up" : "Switch to Deduct"}
              >
                {mode === "deduct" ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onOpenSettings(allowance);
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 text-center">
            <div className="space-y-6">
              <div className="relative group">
                <span className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-black transition-colors duration-500",
                  mode === "deduct" ? "text-primary" : "text-emerald-500"
                )}>₱</span>
                <input 
                  autoFocus
                  required
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className={cn(
                    "w-full bg-muted/30 border-2 rounded-[2.5rem] px-12 py-8 text-6xl font-black focus:outline-none transition-all text-center tabular-nums placeholder:opacity-20",
                    error ? "border-rose-500 bg-rose-500/5 text-rose-500" : (mode === "deduct" ? "focus:border-primary/20 text-foreground border-transparent" : "focus:border-emerald-500/20 text-emerald-600 border-transparent")
                  )}
                />
                {error && (
                  <p className="mt-4 text-rose-500 font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-300">
                    {error}
                  </p>
                )}
              </div>

              <div className="relative">
                <input 
                  placeholder={mode === "deduct" ? "What's the expense? (e.g. Lunch, Taxi)" : "What's the source? (e.g. Gift, Bonus)"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/10 text-base font-bold text-center placeholder:italic placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-4">
              <button 
                type="submit" 
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                className={cn(
                  "w-full text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 disabled:opacity-50",
                  mode === "deduct" 
                    ? "bg-primary hover:bg-primary/90 shadow-primary/30" 
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                )}
              >
                {submitting ? "Synchronizing..." : (mode === "deduct" ? "Deduct from Budget" : "Add to Budget")}
                {mode === "deduct" ? <ArrowDownCircle className="w-7 h-7" /> : <ArrowUpCircle className="w-7 h-7" />}
              </button>
              
              <div className="flex items-center justify-center gap-2 py-2">
                <div className={cn("w-2 h-2 rounded-full", submitting ? "bg-amber-500 animate-spin" : (mode === "deduct" ? "bg-primary animate-pulse" : "bg-emerald-500 animate-pulse"))} />
                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">
                  {submitting ? "Communicating with Cloud..." : (mode === "deduct" 
                    ? "Updates linked account balance" 
                    : "Increases budget & account balance")}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
