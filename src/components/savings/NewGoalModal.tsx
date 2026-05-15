"use client";

import { useState } from "react";
import { X, Target, Landmark, Wallet, Banknote, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/lib/store";

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewGoalModal({ isOpen, onClose }: NewGoalModalProps) {
  const { accounts, addSavingsGoal } = useFinanceStore();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || "");
  const [deductionAccountId, setDeductionAccountId] = useState(accounts[0]?.id || "");
  const [isSuccess, setIsSuccess] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const amount = parseFloat(targetAmount);
    console.log("[NewGoalModal] handleCreate called", { name, amount, targetAccountId, deductionAccountId });

    if (!name) { setError("Please enter a goal name."); return; }
    if (isNaN(amount) || amount <= 0) { setError("Please enter a valid amount."); return; }
    if (!targetAccountId) { setError("Please select a target account."); return; }
    if (!deductionAccountId) { setError("Please select a deduction account."); return; }

    setSubmitting(true);
    setError(null);
    try {
      await addSavingsGoal({
        name,
        targetAmount: amount,
        targetAccountId,
        deductionAccountId
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setTargetAmount("");
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("[NewGoalModal] addSavingsGoal failed:", err);
      setError(err.message || "Failed to create goal. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-all duration-500"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg rounded-[3rem] p-1 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar bg-white border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 pointer-events-none" />
        
      <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="text-left pr-12 md:pr-0">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter">New Strategic Goal</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Initialize Capital Accumulation</p>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:static w-9 h-9 md:w-10 md:h-10 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors border border-border/10"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-emerald-500">Goal Initialized</h3>
                <p className="text-sm text-muted-foreground font-bold mt-2 italic">"{name}" has been added to your strategic plan.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Goal Name */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">What is this for?</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Car, House, Travel"
                  className="w-full bg-muted/40 border border-border/10 rounded-2xl py-4 px-6 text-xl font-black tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20"
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Target Amount</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-primary/40 group-focus-within:text-primary transition-colors">₱</div>
                  <input 
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-muted/40 border border-border/10 rounded-2xl py-4 pl-12 pr-6 text-2xl font-black tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20"
                  />
                </div>
              </div>

              {/* Account Selections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Saving Into</label>
                  <select 
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    className="w-full bg-muted/40 border border-border/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id} className="bg-background text-foreground">{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Deduct From</label>
                  <select 
                    value={deductionAccountId}
                    onChange={(e) => setDeductionAccountId(e.target.value)}
                    className="w-full bg-muted/40 border border-border/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  >
                    {accounts.map(acc => (
                      <option 
                        key={acc.id} 
                        value={acc.id} 
                        disabled={acc.id === targetAccountId}
                        className="bg-background text-foreground"
                      >
                        {acc.name} {acc.id === targetAccountId ? "(Target Account)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-1">
                  {error}
                </p>
              )}

              {/* Action Button */}
              <button 
                onClick={handleCreate}
                disabled={submitting || !name || !targetAmount || parseFloat(targetAmount) <= 0}
                className="w-full py-5 mt-4 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3 group"
              >
                {submitting ? (
                  "Synchronizing Strategy..."
                ) : (
                  <>
                    Create Strategy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
