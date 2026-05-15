"use client";

import { useState } from "react";
import { X, Plus, Calendar, Tag, Wallet, MessageSquare } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import { formatLocalDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const accounts = useFinanceStore((state) => state.accounts);
  
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [account, setAccount] = useState(accounts[0]?.name || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category,
        account,
        date: formatLocalDate(),
      });
      onClose();
    } catch (err: any) {
      setError("Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-lg max-h-[90vh] md:max-h-[85vh] flex flex-col rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="p-6 md:p-8 pb-4 flex items-center justify-between shrink-0 border-b border-border/50">
          <h2 className="text-2xl font-black tracking-tight">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 pt-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          <div className="flex p-1 bg-muted rounded-2xl">
            <button 
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                type === "expense" ? "bg-white dark:bg-slate-800 shadow-md text-rose-500" : "text-muted-foreground"
              )}
            >
              Expense
            </button>
            <button 
              onClick={() => setType("income")}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                type === "income" ? "bg-white dark:bg-slate-800 shadow-md text-emerald-500" : "text-muted-foreground"
              )}
            >
              Income
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pb-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount (PHP)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold">₱</span>
                <input 
                  autoFocus
                  required
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-3xl px-12 py-6 text-4xl font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account</label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select 
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  >
                    <option value="" disabled>Select account</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Housing</option>
                    <option>Salary</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  required
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                />
              </div>
            </div>

            {error && <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 group disabled:opacity-50"
            >
              {submitting ? "Logging to Cloud..." : "Save Transaction"}
              <Plus className={cn("w-6 h-6 group-hover:rotate-90 transition-transform duration-300", submitting && "animate-spin")} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
