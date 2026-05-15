"use client";

import { useFinanceStore } from "@/lib/store";
import { Plus, PieChart, ShoppingCart, Home, Car, Utensils, Sparkles, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
  const budgets = useFinanceStore((state) => state.budgets);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets & Planning</h1>
          <p className="text-muted-foreground mt-1">Smart tracking for your shared spending goals.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Create Budget
        </button>
      </div>

      {/* AI Prediction Banner */}
      <div className="glass-card rounded-3xl p-6 bg-indigo-500/10 border-indigo-500/20 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">AI Budget Analysis</h3>
          <p className="text-muted-foreground">
            Based on your current spending, you are likely to exceed your <span className="text-foreground font-semibold">Entertainment</span> budget by ₱1,500 this month. 
            Would you like to adjust your savings goal for next month?
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors">Adjust</button>
          <button className="px-4 py-2 bg-muted rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors">Dismiss</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Budgets List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Active Budgets</h3>
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
            const isOver = budget.spent > budget.amount;

            return (
              <div key={budget.id} className="glass-card rounded-3xl p-6 group hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      {budget.name === "Groceries" ? <ShoppingCart className="w-5 h-5" /> : <PieChart className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold">{budget.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{budget.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₱{budget.spent.toLocaleString()} <span className="text-muted-foreground text-sm font-normal">/ ₱{budget.amount.toLocaleString()}</span></p>
                  </div>
                </div>

                <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-4">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isOver ? "bg-rose-500" : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className={cn("font-medium", isOver ? "text-rose-500" : "text-muted-foreground")}>
                    {isOver ? `₱${(budget.spent - budget.amount).toLocaleString()} over budget` : `₱${(budget.amount - budget.spent).toLocaleString()} remaining`}
                  </span>
                  <span className="text-muted-foreground">{percentage.toFixed(0)}% used</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grocery Budget System */}
        <div className="glass-card rounded-3xl p-8 space-y-6 bg-emerald-500/[0.02] border-emerald-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShoppingCart className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Grocery Tracker</h3>
            </div>
            <button className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Items tracked for current grocery run:</p>
            <div className="space-y-3">
              {[
                { name: "Rice (5kg)", est: 350, act: 320, done: true },
                { name: "Organic Eggs", est: 250, act: 280, done: true },
                { name: "Chicken Breast", est: 600, act: 0, done: false },
                { name: "Vegetables", est: 400, act: 0, done: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={item.done} 
                      readOnly
                      className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-500" 
                    />
                    <span className={cn("font-medium", item.done && "line-through text-muted-foreground")}>{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Est: ₱{item.est}</p>
                    {item.act > 0 && <p className="text-sm font-bold text-emerald-500">₱{item.act}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">AI Recommendation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Buy Rice in 10kg bags to save <span className="text-foreground font-semibold">₱120</span> monthly. Your consumption pattern suggests you refill every 12 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
