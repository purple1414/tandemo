"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFinanceStore } from "@/lib/store";
import { useModals } from "@/components/layout/ModalProvider";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { Plus, Download, BrainCircuit, Calendar, ChevronDown, Landmark, Wallet, MoreVertical, ChevronRight, ChevronLeft, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const { accounts, transactions, allowances, savingsGoals } = useFinanceStore();
  const { openTransactionModal, openAllowanceModal, openQuickDeductModal, openNewGoalModal } = useModals();
  const [dashboardRange, setDashboardRange] = useState<string>("Monthly");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"main" | "allowance" | "selection" | null>(null);
  
  const [isInsightVisible, setIsInsightVisible] = useState(true);
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  const [dynamicInsight, setDynamicInsight] = useState("");

  useEffect(() => {
    // Basic AI Insight Logic
    const foodExpenses = transactions
      .filter(tx => tx.category === "Food" && tx.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    if (foodExpenses > 5000) {
      setDynamicInsight(`You spent ₱${foodExpenses.toLocaleString()} on food this period. By reducing this by 20%, you could accelerate your "${savingsGoals[0]?.name || 'Savings'}" goal by 1.5 months.`);
    } else if (transactions.length > 5) {
      const topCategory = transactions
        .filter(tx => tx.type === "expense")
        .reduce((acc: any, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
          return acc;
        }, {});
      const sorted = Object.entries(topCategory).sort((a: any, b: any) => b[1] - a[1]);
      if (sorted[0]) {
        setDynamicInsight(`Your top expense category is ${sorted[0][0]}. Tandemo recommends a 15% optimization to improve your net liquidity.`);
      }
    }
  }, [transactions, savingsGoals]);
  
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Helper to filter by date range
  const filterByRange = (date: string, range: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (range) {
      case "Daily": return diffDays <= 1;
      case "Weekly": return diffDays <= 7;
      case "Monthly": return diffDays <= 30;
      case "Bi-Monthly": return diffDays <= 60;
      case "Yearly": return diffDays <= 365;
      case "All": return true;
      default: return true;
    }
  };

  const filterByPreviousRange = (date: string, range: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let start: number, end: number;
    switch (range) {
      case "Daily": start = 2; end = 1; break;
      case "Weekly": start = 14; end = 7; break;
      case "Monthly": start = 60; end = 30; break;
      case "Bi-Monthly": start = 120; end = 60; break;
      case "Yearly": start = 730; end = 365; break;
      default: return false;
    }
    return diffDays <= start && diffDays > end;
  };

  const filteredSpent = transactions
    .filter(tx => tx.type === "expense" && filterByRange(tx.date, dashboardRange))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const previousSpent = transactions
    .filter(tx => tx.type === "expense" && filterByPreviousRange(tx.date, dashboardRange))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expiredAllowances = allowances.filter(al => al.status === "expired" && filterByRange(al.endDate, dashboardRange));
  const activeAllowances = allowances.filter(al => al.status === "active");
  const actualBankedSavings = expiredAllowances.reduce((acc, al) => acc + Math.max(0, al.amount - al.spent), 0);
  const liveProjectedSavings = activeAllowances.reduce((acc, al) => acc + Math.max(0, al.amount - al.spent), 0);
  const filteredSavings = actualBankedSavings + liveProjectedSavings;

  const prevExpiredAllowances = allowances.filter(al => al.status === "expired" && filterByPreviousRange(al.endDate, dashboardRange));
  const prevActiveAllowances = allowances.filter(al => al.status === "active" && filterByPreviousRange(al.startDate, dashboardRange));
  const prevBankedSavings = prevExpiredAllowances.reduce((acc, al) => acc + Math.max(0, al.amount - al.spent), 0);
  const prevProjectedSavings = prevActiveAllowances.reduce((acc, al) => acc + Math.max(0, al.amount - al.spent), 0);
  const previousSavings = prevBankedSavings + prevProjectedSavings;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const spentChange = calculateChange(filteredSpent, previousSpent);
  const savedChange = calculateChange(filteredSavings, previousSavings);
  
  // Net Worth change is harder with only transactions, but we can estimate
  const netWorthChange = calculateChange(totalBalance, totalBalance - (filteredSpent - filteredSavings));

  const ranges = ["Daily", "Weekly", "Monthly", "Bi-Monthly", "Yearly", "All"];

  const handleExportCSV = () => {
    console.log("Initiating Full Financial Export...");
    
    if (transactions.length === 0 && accounts.length === 0) {
      alert("No data available for export.");
      return;
    }

    try {
      const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
      const exportDate = new Date().toLocaleString();

      // Summary Section
      const summaryRows = [
        ["FINANCIAL SUMMARY"],
        ["Net Worth", `₱${totalBalance.toFixed(2)}`],
        ["Export Date", exportDate],
        ["Total Transactions", transactions.length],
        [], // Spacer
        ["TRANSACTION HISTORY"]
      ];

      // Transactions Header
      const headers = ["Date", "Description", "Category", "Account", "Type", "Amount"];
      
      // Transaction Rows with robust checks
      const txRows = transactions.map(tx => [
        tx.date || "N/A",
        `"${(tx.description || "No Description").replace(/"/g, '""')}"`,
        tx.category || "Uncategorized",
        tx.account || "Default Account",
        (tx.type || "expense").toUpperCase(),
        (tx.amount || 0).toFixed(2)
      ]);

      // Construct final CSV
      const csvContent = [
        ...summaryRows.map(r => r.join(",")),
        headers.join(","),
        ...txRows.map(r => r.join(","))
      ].join("\n");

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `tandemo-full-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      
      alert("Full Financial Report Compiled Successfully! Your download should begin now.");
      
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("Export Successful.");
    } catch (error) {
      console.error("Export Failed:", error);
      alert("An error occurred while generating the report. Please check your data.");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good evening, Tandemo</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time status of your shared financial operating system.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-start md:justify-end w-full md:w-auto">
          {/* Time Range Selector - Minimalist Executive Icon */}
          <div className="relative ml-auto md:ml-0 order-last md:order-first">
            <button
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className={cn(
                "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-muted/40 hover:bg-muted/60 border border-white/5 rounded-xl transition-all group active:scale-95",
                isRangeOpen && "bg-primary/10 border-primary/20"
              )}
              title={`View by: ${dashboardRange}`}
            >
              <Calendar className={cn("w-4 h-4 md:w-5 md:h-5 transition-colors", isRangeOpen ? "text-primary" : "text-muted-foreground")} />
            </button>

            {isRangeOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsRangeOpen(false)} 
                />
                <div className="absolute top-full right-0 mt-3 w-56 max-w-[calc(100vw-2rem)] bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-20">
                  <div className="p-2">
                    <div className="px-4 py-3 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Perspective</p>
                    </div>
                    {ranges.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setDashboardRange(r);
                          setIsRangeOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-widest transition-all text-left",
                          dashboardRange === r 
                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {r}
                        {dashboardRange === r && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-muted rounded-xl text-xs md:text-sm font-semibold hover:bg-muted/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">Insights</span>
          </button>
          
          <div className="relative hidden md:block">
            <button 
              onClick={() => setActiveMenu(activeMenu ? null : "main")}
              className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-primary text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 group"
            >
              <div className="w-5 h-5 flex items-center justify-center relative">
                <Plus className={cn("w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 absolute", activeMenu && "scale-0 rotate-90")} />
                <MoreVertical className={cn("w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 absolute scale-0", activeMenu && "scale-100 rotate-90")} />
              </div>
              <span className="uppercase tracking-widest">Action</span>
              <ChevronDown className={cn("w-3 h-3 md:w-4 md:h-4 opacity-50 transition-transform duration-300", activeMenu && "rotate-180")} />
            </button>

            {activeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                <div className="absolute top-full right-0 mt-3 w-72 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-20 p-2">
                  
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Net Worth" 
          amount={totalBalance} 
          change={netWorthChange} 
          icon="wallet" 
        />
        <SummaryCard 
          title={`Spent (${dashboardRange})`} 
          amount={filteredSpent} 
          change={spentChange} 
          icon="card" 
        />
        <SummaryCard 
          title={`Saved (${dashboardRange})`} 
          amount={filteredSavings} 
          change={savedChange} 
          icon="savings" 
        />
        <div 
          onClick={() => router.push("/savings")}
          className="glass-card rounded-3xl p-6 flex flex-col justify-between text-left hover:scale-[1.02] transition-all active:scale-[0.98] group/card cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-hover/card:text-primary transition-colors">Savings Goals</h3>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openNewGoalModal();
              }}
              className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all group-hover/card:scale-110"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {savingsGoals.slice(0, 2).map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-[10px] mb-1.5 uppercase tracking-widest font-bold">
                    <span className="text-muted-foreground truncate mr-2">{goal.name}</span>
                    <span className="text-foreground">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {savingsGoals.length === 0 && (
              <div className="py-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">No Active Goals</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
            <span>{savingsGoals.length} Total Goals</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SpendingChart />
          
      {/* AI Budget Insight Card */}
      {isInsightVisible && (
        <div className="glass-card rounded-[2.5rem] p-8 bg-primary/5 border border-primary/20 relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative z-10 flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <BrainCircuit className="text-white w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black tracking-tight text-slate-900">AI Budget Insight</h3>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[8px] font-black uppercase tracking-widest text-primary animate-pulse">Critical Analysis</span>
              </div>
              <p className="text-slate-600 font-bold mt-2 max-w-2xl leading-relaxed">
                {dynamicInsight || "Your spending pattern is stable. No immediate optimizations required."}
              </p>
              <div className="flex gap-6 mt-6">
                <button 
                  onClick={() => setIsOptimizationOpen(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:scale-105 transition-transform flex items-center gap-2"
                >
                  Optimize Budget <ChevronRight className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setIsInsightVisible(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/20 transition-colors" />
        </div>
      )}

      {/* Optimization Modal */}
      {isOptimizationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsOptimizationOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] p-1 shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bot className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-slate-900">Optimization Strategy</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Algorithm: Tandemo-Alpha-9</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Recommended Adjustments</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-xs">🍔</div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Dining Out</span>
                      </div>
                      <span className="text-xs font-black text-rose-500">- ₱2,500</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">📈</div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Strategic Savings</span>
                      </div>
                      <span className="text-xs font-black text-emerald-500">+ ₱2,500</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Projected Impact</p>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed italic">
                    "By reallocating this surplus, your Japan Trip goal will be reached 14 days earlier than currently projected."
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOptimizationOpen(false)}
                className="w-full py-5 mt-8 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
              >
                Implement Strategy
              </button>
            </div>
          </div>
        </div>
      )}
        </div>

        <div className="space-y-8">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
