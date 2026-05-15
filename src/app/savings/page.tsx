"use client";

import { useState } from "react";
import { Plus, Target, TrendingUp, Wallet, ChevronRight, PiggyBank, Calendar, ArrowUpRight, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

import { useFinanceStore, SavingsGoal } from "@/lib/store";
import ContributionModal from "@/components/savings/ContributionModal";
import NewGoalModal from "@/components/savings/NewGoalModal";

export default function SavingsPage() {
  const { savingsGoals } = useFinanceStore();
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallProgress = (totalSaved / totalTarget) * 100 || 0;

  const handleGoalClick = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContributionModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
          <h1 className="text-4xl font-black tracking-tighter">Savings Goals</h1>
          <p className="text-muted-foreground mt-2 text-base">Strategizing your long-term capital accumulation.</p>
        </div>
        <button 
          onClick={() => setIsNewGoalModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          New Goal
        </button>
      </div>

      {/* Executive Summary Card */}
      {(() => {
        const theme = overallProgress < 30 
          ? { color: "text-rose-600 dark:text-rose-400", accent: "text-rose-700 dark:text-rose-300", bg: "from-rose-500/10 via-orange-500/5 to-amber-500/10", border: "border-rose-500/20", glow: "bg-rose-500", status: "Momentum Building" }
          : overallProgress < 70
            ? { color: "text-indigo-600 dark:text-indigo-400", accent: "text-indigo-700 dark:text-indigo-300", bg: "from-indigo-600/10 via-blue-500/5 to-violet-500/10", border: "border-indigo-500/20", glow: "bg-indigo-500", status: "On Track" }
            : { color: "text-emerald-600 dark:text-emerald-400", accent: "text-emerald-700 dark:text-emerald-300", bg: "from-emerald-600/10 via-teal-500/5 to-cyan-500/10", border: "border-emerald-500/20", glow: "bg-emerald-500", status: "Strategic Target Near" };

        return (
          <div className={cn(
            "glass-card rounded-[3rem] p-1 shadow-2xl relative overflow-hidden transition-all duration-1000",
            theme.border
          )}>
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30 transition-all duration-1000 blur-3xl", theme.bg)} />
            <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-[80px] pointer-events-none" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/30 relative z-10">
              <div className="p-10 relative overflow-hidden group/section text-left">
                <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover/section:scale-110 transition-transform duration-700 blur-xl", theme.glow)} />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-muted-foreground/70">Total Accumulated</p>
                  <h2 className="text-5xl font-black tracking-tight mb-2 text-foreground">₱{totalSaved.toLocaleString()}</h2>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>Active Growth</span>
                  </div>
                </div>
              </div>

              <div className="p-10 relative overflow-hidden group/section bg-white/5 dark:bg-black/5 text-left">
                <div className={cn("absolute inset-0 opacity-5 transition-all duration-1000", theme.bg)} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Overall Progress</p>
                    <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/20 border backdrop-blur-md shadow-sm text-muted-foreground border-muted-foreground/20")}>
                      {theme.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <h2 className="text-5xl font-black tracking-tight text-foreground">{overallProgress.toFixed(1)}%</h2>
                    <span className="text-xs font-black text-muted-foreground opacity-40 uppercase tracking-widest">Efficiency</span>
                  </div>
                  <div className="w-full h-4 bg-muted/50 rounded-full overflow-hidden p-1 shadow-inner">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000 ease-out relative")}
                      style={{ 
                        width: `${overallProgress}%`,
                        backgroundColor: overallProgress < 30 ? '#e11d48' : overallProgress < 70 ? '#4f46e5' : '#059669'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 relative overflow-hidden group/section text-left">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/section:scale-110 transition-transform duration-700">
                  <Wallet className="w-24 h-24 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-6">Remaining Required</p>
                  <h2 className="text-5xl font-black tracking-tight mb-2 text-foreground">₱{(totalTarget - totalSaved).toLocaleString()}</h2>
                  <p className="text-xs text-muted-foreground font-bold italic opacity-60">Strategic backlog analysis</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {savingsGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div 
              key={goal.id} 
              onClick={() => handleGoalClick(goal)}
              className="glass-card rounded-[2.5rem] p-8 hover:bg-muted/30 transition-all group/goal cursor-pointer relative overflow-hidden text-left"
            >
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-primary text-white shadow-lg")}>
                    <Target className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black tracking-tight truncate">{goal.name}</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Goal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tracking-tight">₱{goal.currentAmount.toLocaleString()}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">of ₱{goal.targetAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Goal Progress</span>
                  <span className="text-foreground">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden p-1">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-primary")}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>In Progress</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
                  Contribute Now <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
        {savingsGoals.length === 0 && (
          <div className="lg:col-span-2 py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <PiggyBank className="w-16 h-16 text-muted-foreground" />
            <div>
              <p className="text-lg font-black tracking-tight uppercase">No Active Goals</p>
              <p className="text-sm text-muted-foreground font-medium">Initialize your first strategic capital accumulation goal.</p>
            </div>
          </div>
        )}
      </div>

      <ContributionModal 
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        goal={selectedGoal}
      />

      <NewGoalModal 
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
      />
    </div>
  );
}
