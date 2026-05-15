"use client";

import { useState, useEffect } from "react";
import { X, Target, Save, Trash2, Calendar, Timer, CheckCircle2 } from "lucide-react";
import { useFinanceStore, Allowance } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowanceToEdit?: Allowance;
}

const frequencies = ["Day", "Week", "Month", "Bi-Month"];

export function AllowanceModal({ isOpen, onClose, allowanceToEdit }: AllowanceModalProps) {
  const { setAllowance, updateAllowance, deleteAllowance, accounts } = useFinanceStore();
  
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"Day" | "Week" | "Month" | "Bi-Month" | "Year" | "Custom">("Day");
  const [accountId, setAccountId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [color, setColor] = useState("#6366f1");
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (allowanceToEdit) {
      setName(allowanceToEdit.name);
      setAmount(allowanceToEdit.amount.toString());
      setFrequency(allowanceToEdit.frequency as any);
      setAccountId(allowanceToEdit.accountId || "");
      setStartDate(allowanceToEdit.startDate);
      setEndDate(allowanceToEdit.endDate);
      setColor(allowanceToEdit.color || "#6366f1");
    } else {
      setName("");
      setAmount("");
      setFrequency("Day");
      setAccountId(accounts[0]?.id || "");
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
      setColor("#6366f1");
    }
  }, [allowanceToEdit, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(acc => acc.id === accountId);
    const val = parseFloat(amount);
    
    if (account && val > account.balance) {
      setError(`Insufficient funds in ${account.name}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const alData = {
      name,
      amount: val,
      frequency,
      accountId,
      startDate,
      endDate,
      color,
    };

    try {
      if (allowanceToEdit) {
        await updateAllowance(allowanceToEdit.id, alData);
      } else {
        await setAllowance(alData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save allowance to cloud.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (allowanceToEdit) {
      setSubmitting(true);
      try {
        await deleteAllowance(allowanceToEdit.id);
        onClose();
      } catch (err: any) {
        setError("Failed to delete allowance.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="p-8 pb-4 flex items-center justify-between shrink-0 border-b border-border/50">
          <h2 className="text-2xl font-black tracking-tight">
            {allowanceToEdit ? "Edit Allowance" : "Set New Allowance"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Live Preview Card */}
          <div className="mb-10 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Live Visual Preview</label>
            <div 
              className="relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden"
              style={{ 
                backgroundColor: `${color}08`,
                borderColor: `${color}30`,
                boxShadow: `0 20px 40px -15px ${color}15`
              }}
            >
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ 
                  background: `radial-gradient(circle at 100% 0%, ${color}40 0%, transparent 60%)` 
                }}
              />
              
              <div className="relative z-10 space-y-6">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black tracking-tight truncate max-w-[200px]">
                      {name || "Allowance Name"}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                      {frequency === "Custom" ? (
                        `${Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} DAYS`
                      ) : frequency}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-black tracking-tighter tabular-nums" style={{ color: color }}>
                      ₱{amount ? Number(amount).toLocaleString() : "1,000"}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Remaining</p>
                  </div>
                </div>

                {/* Progress Bar Mockup */}
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 opacity-20"
                    style={{ backgroundColor: color, width: '100%' }}
                  />
                </div>

                {/* Usage Section */}
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Usage Today</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black tabular-nums">₱0</span>
                      <span className="text-xs font-bold opacity-20">/ ₱{amount ? Number(amount).toLocaleString() : "1,000"}</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2 opacity-50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Finalize & Bank</span>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-center pt-4 border-t border-border/5">
                  <div className="flex items-center gap-2 opacity-40">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <p className="text-[9px] font-black uppercase tracking-widest">
                      {accounts.find(a => a.id === accountId)?.name || "Source Account"}
                    </p>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                    End: {endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Allowance Amount (PHP)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold">₱</span>
                <input 
                  required
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className={cn(
                    "w-full bg-muted/50 border rounded-3xl px-12 py-6 text-4xl font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center tabular-nums",
                    error && error.includes("funds") ? "border-rose-500/50 bg-rose-500/5 text-rose-500" : "border-border"
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Allowance Name</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    required
                    placeholder="e.g. Weekly Meals, Transportation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {["Day", "Week", "Month", "Bi-Month", "Year", "Custom"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setFrequency(f as any);
                        if (f !== "Custom") {
                          const now = new Date();
                          if (f === "Day") now.setDate(now.getDate() + 1);
                          else if (f === "Week") now.setDate(now.getDate() + 7);
                          else if (f === "Bi-Month") now.setDate(now.getDate() + 14);
                          else if (f === "Month") now.setMonth(now.getMonth() + 1);
                          else if (f === "Year") now.setFullYear(now.getFullYear() + 1);
                          setEndDate(now.toISOString().split('T')[0]);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-2xl border font-bold text-sm transition-all",
                        frequency === f 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Calendar className="w-4 h-4" />
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {frequency !== "Custom" ? (
                  <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-3">Timeline Period</p>
                    <div className="flex items-center gap-4 text-xl font-black text-primary">
                      <span>{new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-primary/20">—</span>
                      <span>{new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">End Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Color Theme</label>
                <div className="flex flex-wrap gap-4 md:gap-3">
                  {["#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#0ea5e9", "#ec4899"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-12 h-12 md:w-9 md:h-9 rounded-full transition-all border-4",
                        color === c ? "border-white dark:border-slate-800 scale-110 shadow-2xl shadow-black/20" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Source Account (for deduction)</label>
                <select 
                  required
                  value={accountId}
                  onChange={(e) => {
                    setAccountId(e.target.value);
                    setError(null);
                  }}
                  className={cn(
                    "w-full bg-muted/50 border rounded-2xl px-5 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold",
                    error && error.includes("funds") ? "border-rose-500/50 bg-rose-500/5 text-rose-500" : "border-border"
                  )}
                >
                  <option value="" disabled>Select an account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (₱{acc.balance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-rose-500 font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-300 ml-1">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              {allowanceToEdit && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="w-14 h-14 rounded-2xl border border-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/10 transition-all shrink-0"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-primary text-white py-4 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  "Synchronizing..."
                ) : (
                  <>
                    {allowanceToEdit ? "Save Changes" : "Create Allowance"}
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
