"use client";

import { useFinanceStore } from "@/lib/store";
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Coffee, Car, Home, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const categoryIcons: Record<string, any> = {
  Food: Coffee,
  Transport: Car,
  Housing: Home,
  Shopping: ShoppingBag,
  Salary: ArrowUpRight,
};

export function RecentTransactions() {
  const transactions = useFinanceStore((state) => state.transactions);
  const router = useRouter();

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Recent Activity</h3>
        <button 
          onClick={() => router.push('/transactions')}
          className="text-sm text-primary font-medium hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <p>No transactions yet</p>
          </div>
        ) : (
          transactions.slice(0, 8).map((tx) => {
            const Icon = categoryIcons[tx.category] || ShoppingBag;
            const isExpense = tx.type === "expense";

            return (
              <div key={tx.id} className="flex items-center gap-4 group">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                  isExpense ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} • {tx.account}</p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "font-bold",
                    isExpense ? "text-foreground" : "text-emerald-500"
                  )}>
                    {isExpense ? "-" : "+"}₱{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
