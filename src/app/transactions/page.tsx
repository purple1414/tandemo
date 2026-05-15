"use client";

import { useFinanceStore } from "@/lib/store";
import { Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, Wallet, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState } from "react";

export default function TransactionsPage() {
  const transactions = useFinanceStore((state) => state.transactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.account.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || tx.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <div className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest animate-in fade-in zoom-in duration-500">
              {filteredTransactions.length} Results
            </div>
          </div>
          <p className="text-muted-foreground mt-1">Detailed log of all shared income and expenses.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[180px] md:w-[280px] transition-all"
            />
          </div>
          <div className="flex p-1 bg-muted rounded-xl gap-1">
            <button 
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                filterType === "all" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType("income")}
              className={cn(
                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                filterType === "income" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Income
            </button>
            <button 
              onClick={() => setFilterType("expense")}
              className={cn(
                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                filterType === "expense" ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Exp
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Account</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {tx.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-bold truncate max-w-[200px]">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{tx.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{tx.account}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-sm font-black",
                      tx.type === "income" ? "text-emerald-500" : "text-foreground"
                    )}>
                      {tx.type === "income" ? "+" : "-"}₱{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-border">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="p-5 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    tx.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {tx.type === "income" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn(
                    "text-sm font-black tracking-tight",
                    tx.type === "income" ? "text-emerald-500" : "text-foreground"
                  )}>
                    {tx.type === "income" ? "+" : "-"}₱{tx.amount.toLocaleString()}
                  </p>
                  <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-xl border border-border/50">
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{tx.category}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-xl border border-border/50">
                  <Wallet className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{tx.account}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-muted-foreground font-bold text-sm">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
