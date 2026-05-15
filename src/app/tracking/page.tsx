"use client";

import { useEffect, useState } from "react";
import { useFinanceStore, Allowance } from "@/lib/store";
import { formatLocalDate, getDaysAgo } from "@/lib/date-utils";
import { 
  Activity,
  Plus, 
  Target, 
  Calendar, 
  TrendingDown, 
  BarChart3, 
  Timer, 
  ArrowUpRight, 
  ArrowDownRight,
  Utensils,
  Car,
  ShoppingBag,
  CreditCard,
  Settings,
  History as HistoryIcon,
  CheckCircle2,
  FilterX,
  Sparkles,
  ChevronRight,
  Send,
  BrainCircuit,
  X,
  TrendingUp,
  ArrowUpCircle,
  XCircle,
  Settings2,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { AllowanceModal } from "@/components/dashboard/AllowanceModal";
import { QuickDeductModal } from "@/components/dashboard/QuickDeductModal";
import { BumpUpModal } from "@/components/dashboard/BumpUpModal";
import { SettleAllowanceModal } from "@/components/dashboard/SettleAllowanceModal";

const categoryIcons: Record<string, any> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: CreditCard,
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-border/50 min-w-[180px]">
        <p className="font-bold mb-2 text-slate-900 dark:text-white border-b border-border/50 pb-2">{data.fullDate || data.day}</p>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between items-center">
            <span>Expense</span>
            <span className="text-sm text-rose-500">-₱{data.expense.toLocaleString()}</span>
          </p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between items-center">
            <span>Added</span>
            <span className="text-sm text-emerald-500">+₱{data.income.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrackingPage() {
  const { 
    transactions, 
    allowances, 
    accounts, 
    sweepExpiredAllowances,
    finishAllowanceEarly,
    reactivateAllowance,
    setAdvisorOpen 
  } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickDeductOpen, setIsQuickDeductOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  const [isBumpUpOpen, setIsBumpUpOpen] = useState(false);
  const [allowanceToBump, setAllowanceToBump] = useState<Allowance | null>(null);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [allowanceToSettle, setAllowanceToSettle] = useState<Allowance | null>(null);
  const [timeRange, setTimeRange] = useState<"7 Days" | "Month" | "Custom">("7 Days");
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [highlightDate, setHighlightDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [customRange, setCustomRange] = useState({ 
    start: getDaysAgo(7), 
    end: formatLocalDate() 
  });

  const [savingsRange, setSavingsRange] = useState<"7 Days" | "Month" | "All Time">("All Time");

  // Inline Card Chat States
  const [isCardChatOpen, setIsCardChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [cardMessages, setCardMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi! I\'m your Tandemo Advisor. Ready to reach your goals? Ask me anything!' }
  ]);

  const handleAdd = () => {
    setSelectedAllowance(null);
    setIsModalOpen(true);
  };

  const handleEdit = (al: Allowance) => {
    setSelectedAllowance(al);
    setIsModalOpen(true);
  };

  const handleCardChat = (input: string) => {
    if (!input.trim()) return;
    setCardMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsTyping(true);

    setTimeout(() => {
      // Analyze data for advice
      const topCat = transactions.reduce((acc: any, t) => {
        if (t.type === 'expense') acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
      const category = Object.entries(topCat).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "General";
      
      let response = "That's a great goal! ";
      if (input.toLowerCase().includes("save")) {
        response += `To save more, I recommend reviewing your "${category}" spending. You could save around ₱200 this week by cutting back there!`;
      } else {
        response += "I'm analyzing your trends. It looks like you're doing well with your current allowances!";
      }

      setCardMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    sweepExpiredAllowances();
  }, []);

  const handleQuickDeduct = (al: Allowance) => {
    setSelectedAllowance(al);
    setIsQuickDeductOpen(true);
  };

  const generateWeeklyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      
      const dayTxs = transactions.filter(t => t.date?.startsWith(dateStr));
      const expense = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = dayTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        fullDate: dateStr,
        expense,
        income,
        count: expense
      });
    }
    return data;
  };

  const generateMonthlyData = () => {
    if (!selectedMonth) return [];
    const [yearStr, monthStr] = selectedMonth.split('-');
    const currentMonth = parseInt(monthStr, 10) - 1;
    const currentYear = parseInt(yearStr, 10);
    
    const data = [
      { day: 'Week 1', expense: 0, income: 0, fullDate: `W0-${selectedMonth}` },
      { day: 'Week 2', expense: 0, income: 0, fullDate: `W1-${selectedMonth}` },
      { day: 'Week 3', expense: 0, income: 0, fullDate: `W2-${selectedMonth}` },
      { day: 'Week 4', expense: 0, income: 0, fullDate: `W3-${selectedMonth}` },
    ];
    
    transactions.forEach(t => {
      const txDate = new Date(t.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        const date = txDate.getDate();
        let week = 0;
        if (date <= 7) week = 0;
        else if (date <= 14) week = 1;
        else if (date <= 21) week = 2;
        else week = 3;
        
        if (t.type === 'expense') data[week].expense += t.amount;
        else data[week].income += t.amount;
      }
    });
    
    return data.map(d => ({ ...d, count: d.expense }));
  };

  const generateCustomData = () => {
    if (!customRange.start || !customRange.end) return [];
    const start = new Date(customRange.start);
    const end = new Date(customRange.end);
    
    // Use local date parts to avoid UTC shifts
    const startObj = new Date(customRange.start + 'T00:00:00');
    const endObj = new Date(customRange.end + 'T00:00:00');
    
    const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const data = [];
    const maxDays = Math.min(diffDays + 1, 31); // Support up to a full month
    
    for (let i = 0; i < maxDays; i++) {
      const d = new Date(startObj);
      d.setDate(startObj.getDate() + i);
      
      const dateStr = formatLocalDate(d);
      
      const dayTxs = transactions.filter(t => t.date?.startsWith(dateStr));
      const expense = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const income = dayTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        expense,
        income,
        count: expense
      });
    }
    return data;
  };

  const chartData = timeRange === "7 Days" ? generateWeeklyData() : timeRange === "Month" ? generateMonthlyData() : generateCustomData();
  const activeAllowances = allowances.filter(al => al.status === "active");
  const expiredAllowances = allowances.filter(al => al.status === "expired");

  const filteredExpired = expiredAllowances.filter(al => {
    if (savingsRange === "All Time") return true;
    
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const endStr = al.endDate; // This is already in YYYY-MM-DD
    
    if (savingsRange === "Month") {
      const [year, month] = endStr.split('-');
      return parseInt(month) === (now.getMonth() + 1) && parseInt(year) === now.getFullYear();
    }
    
    if (savingsRange === "7 Days") {
      const endDate = new Date(endStr);
      const startTime = new Date();
      startTime.setDate(now.getDate() - 7);
      startTime.setHours(0, 0, 0, 0);
      return endDate >= startTime && endStr <= todayStr;
    }
    return true;
  });

  const actualBankedSavings = filteredExpired.reduce((acc, al) => acc + Math.max(0, al.amount - al.spent), 0);
  const liveProjectedSavings = activeAllowances.reduce((acc, al) => acc + Math.max(0, al.amount - al.spent), 0);
  const totalCombinedSavings = liveProjectedSavings;

  const generateSavingsChartData = () => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    
    if (savingsRange === "7 Days") {
      const data = [];
      const current = new Date();
      const dayOfWeek = current.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(current);
      monday.setDate(current.getDate() - diffToMonday);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toLocaleDateString('en-CA');
        const banked = expiredAllowances
          .filter(al => al.endDate === dateStr)
          .reduce((sum, al) => sum + Math.max(0, al.amount - al.spent), 0);
        const isToday = dateStr === todayStr;
        const projected = isToday ? liveProjectedSavings : 0;
        data.push({
          date: dateStr,
          day: `${d.toLocaleDateString(undefined, { weekday: 'narrow' })} ${d.getDate()}`,
          banked,
          projected,
          total: banked + projected
        });
      }
      return data;
    } else if (savingsRange === "Month") {
      // Monthly view: Aggregate by weeks (Mon-Sun)
      const data = [];
      const current = new Date();
      
      const dayOfWeek = current.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfCurrentWeek = new Date(current);
      startOfCurrentWeek.setDate(current.getDate() - diffToMonday);
      
      for (let w = 3; w >= 0; w--) {
        const weekStart = new Date(startOfCurrentWeek);
        weekStart.setDate(startOfCurrentWeek.getDate() - (w * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        let weekBanked = 0;
        let weekProjected = 0;
        for (let d = 0; d < 7; d++) {
          const targetDate = new Date(weekStart);
          targetDate.setDate(weekStart.getDate() + d);
          const dateStr = targetDate.toLocaleDateString('en-CA');
          weekBanked += expiredAllowances
            .filter(al => al.endDate === dateStr)
            .reduce((sum, al) => sum + Math.max(0, al.amount - al.spent), 0);
          if (dateStr === todayStr) weekProjected += liveProjectedSavings;
        }
        data.push({ 
          day: `Week ${4-w}`, 
          fullDate: `W${3-w}-${selectedMonth}`, 
          banked: weekBanked, 
          projected: weekProjected, 
          total: weekBanked + weekProjected 
        });
      }
      return data;
    } else {
      // All Time view: Aggregate by Month (last 6 months)
      const data = [];
      for (let m = 5; m >= 0; m--) {
        const targetMonth = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const monthLabel = targetMonth.toLocaleDateString(undefined, { month: 'short' });
        
        let monthBanked = 0;
        let monthProjected = 0;
        
        expiredAllowances.forEach(al => {
          const alDate = new Date(al.endDate);
          if (alDate.getMonth() === targetMonth.getMonth() && alDate.getFullYear() === targetMonth.getFullYear()) {
            monthBanked += Math.max(0, al.amount - al.spent);
          }
        });

        if (targetMonth.getMonth() === now.getMonth() && targetMonth.getFullYear() === now.getFullYear()) {
          monthProjected = liveProjectedSavings;
        }

        data.push({
          day: monthLabel,
          banked: monthBanked,
          projected: monthProjected,
          total: monthBanked + monthProjected
        });
      }
      return data;
    }
  };

  const savingsChartData = generateSavingsChartData();


  const periodExpense = chartData.reduce((sum, d) => sum + d.expense, 0);
  const periodIncome = chartData.reduce((sum, d) => sum + d.income, 0);

  const handleBarClick = (payload: any) => {
    if (payload && (payload.fullDate || payload.date)) {
      const date = payload.fullDate || payload.date;
      setHighlightDate(date);
      document.getElementById("daily-spending-timeline")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">Tracker</h1>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          New Allowance
        </button>
      </div>

      {/* Landscape Hero Section */}
      <div className="rounded-[3rem] p-10 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden group shadow-sm ring-1 ring-white/50 dark:ring-emerald-400/50 border border-emerald-500/10 dark:border-emerald-400/50 backdrop-blur-[40px] bg-white/40 dark:bg-emerald-900/90 dark:bg-gradient-to-br dark:from-emerald-700/60 dark:via-emerald-800/80 dark:to-emerald-950/90 mb-10 shadow-inner dark:shadow-[inset_0_0_80px_rgba(16,185,129,0.2),0_0_50px_-12px_rgba(16,185,129,0.4)]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] dark:from-emerald-400/60 via-transparent dark:via-emerald-500/30 to-blue-500/[0.05] dark:to-emerald-700/40 pointer-events-none mix-blend-overlay" />
        
        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10 w-full">
          {/* Stats Column */}
          <div className="flex-1 flex flex-col lg:flex-row items-center gap-8">
            <div className="text-center lg:text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700/60 dark:text-emerald-300/80 mb-2">
                TOTAL ACTIVE ALLOWANCE
              </p>
              <h2 className="text-7xl font-black text-emerald-600 dark:text-emerald-300 tracking-tighter leading-none dark:drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">₱{totalCombinedSavings.toLocaleString()}</h2>
            </div>
            
            <div className="inline-flex items-center gap-4 bg-blue-500/10 border-2 border-white rounded-3xl px-6 py-4 shadow-xl shadow-blue-500/5">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-lg font-black uppercase tracking-wider text-white whitespace-nowrap">
                ₱{actualBankedSavings.toLocaleString()} {savingsRange === "All Time" ? "Total Saved" : savingsRange === "7 Days" ? "Saved this Week" : "Saved this Month"}
              </span>
            </div>
          </div>

          {/* Filter Column */}
          <div className="flex items-center gap-2 p-2 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 backdrop-blur-md shrink-0 shadow-inner">
            {(["7 Days", "Month", "All Time"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSavingsRange(range)}
                className={cn(
                  "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  savingsRange === range
                    ? "bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 scale-[1.05]"
                    : "text-emerald-600/60 dark:text-emerald-400/60 hover:text-emerald-500 dark:hover:text-emerald-400"
                )}
              >
                {range === "7 Days" ? "Week" : range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Tactical Column: Active Allowances */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Active Allowances Matrix</h3>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{activeAllowances.length} Online</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeAllowances.length > 0 ? (
              activeAllowances.map(al => {
                const percentage = Math.min(100, (al.spent / al.amount) * 100);
                const remaining = Math.max(0, al.amount - al.spent);
                const bgOpacity = Math.floor(3 + (percentage / 100) * 20).toString(16).padStart(2, '0');
                const borderOpacity = Math.floor(20 + (percentage / 100) * 40).toString(16).padStart(2, '0');
                
                return (
                  <div 
                    key={al.id} 
                    className="rounded-[3rem] p-10 transition-all relative overflow-hidden group/card border shadow-sm"
                    style={{ 
                      backgroundColor: `${al.color}${bgOpacity}`,
                      borderColor: `${al.color}${borderOpacity}`,
                      boxShadow: `0 20px 50px -12px ${al.color}20`
                    }}
                    onClick={() => {
                      setSelectedAllowance(al);
                      setIsQuickDeductOpen(true);
                    }}
                  >
                    <div 
                      className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 -mr-32 -mt-32 rounded-full"
                      style={{ backgroundColor: al.color }}
                    />
                    <div className="relative z-10 space-y-10">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-4xl font-black tracking-tighter text-foreground">{al.name}</h4>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/70 dark:text-slate-400/70 mt-3">Week</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black tracking-tighter" style={{ color: al.color }}>₱{remaining.toLocaleString()}</p>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/70 dark:text-slate-400/70 mt-3">Remaining</p>
                        </div>
                      </div>

                      {/* Visual Divider / Progress */}
                      <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 transition-all duration-1000" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: al.color || "#6366f1"
                          }}
                        />
                      </div>

                      {/* Middle Section */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/70 dark:text-slate-400/70 mb-4">Usage Today</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter text-foreground">₱{al.spent.toLocaleString()}</span>
                            <span className="text-xl font-bold text-slate-400 dark:text-slate-500">/ ₱{al.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-8 border-t border-slate-50 dark:border-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: al.color }} />
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/90 dark:text-slate-400/90">{al.category}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500/90 dark:text-slate-400/90">
                            End: {al.endDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setAllowanceToSettle(al);
                                setIsSettleOpen(true);
                              }}
                              className="p-2 hover:bg-emerald-500/10 text-emerald-500/30 hover:text-emerald-500 rounded-xl transition-all"
                              title="Finalize & Bank"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(al);
                              }}
                              className="p-2 hover:bg-primary/10 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary rounded-xl transition-all"
                              title="Settings"
                            >
                              <Settings2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center bg-muted/5 rounded-[3rem] border border-dashed border-border/20">
                <p className="text-sm font-black text-muted-foreground/20 uppercase tracking-[0.4em]">No Active Allowances</p>
              </div>
            )}
          </div>

          {/* History Section */}
          {filteredExpired.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-4 px-2">
                <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <HistoryIcon className="w-3.5 h-3.5" />
                  History Timeline ({filteredExpired.length})
                </h3>
                {filteredExpired.length > 3 && (
                  <button 
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/30 hover:text-primary transition-all flex items-center gap-1.5 group"
                  >
                    {showAllHistory ? "Compact" : "View All"}
                    <ChevronRight className={cn("w-3 h-3 transition-transform duration-500", showAllHistory ? "rotate-90" : "group-hover:translate-x-1")} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(showAllHistory ? filteredExpired : filteredExpired.slice(0, 3)).map(al => (
                  <div key={al.id} className="glass-card rounded-[2.5rem] p-6 opacity-60 grayscale-[0.6] hover:grayscale-0 hover:opacity-100 transition-all border-border/10 shadow-sm group/archive">
                    <div className="flex justify-between items-center mb-6">
                      <div className="min-w-0">
                        <h5 className="font-bold text-base tracking-tight truncate group-hover/archive:text-primary transition-colors">{al.name}</h5>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 mt-1">{al.startDate} — {al.endDate}</p>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center shrink-0">
                        <HistoryIcon className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">Spent</p>
                          <p className="font-bold text-xl tabular-nums tracking-tighter">₱{al.spent.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1">Limit</p>
                          <p className="font-bold text-sm tabular-nums opacity-20">₱{al.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">₱{Math.max(0, al.amount - al.spent).toLocaleString()} Recovered</p>
                        <button 
                          onClick={() => {
                            setAllowanceToBump(al);
                            setIsBumpUpOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 border border-emerald-500/20"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          Bump Up
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
        </div>

        {/* Analytical Column: Intensity + Archive */}
        <div className="lg:col-span-8 space-y-10">
          {/* Intensity Chart Card */}
          <div className="glass-card rounded-[3rem] p-10 overflow-hidden relative border-border/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Spending Intensity
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-40">Operational Pattern Visualization</p>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="flex bg-muted/20 p-2 rounded-2xl backdrop-blur-3xl border border-border/10 shadow-inner">
                  {(["7 Days", "Month", "Custom"] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setHighlightDate(null);
                      }}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                        timeRange === range ? "bg-primary text-white shadow-2xl shadow-primary/40 scale-105" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-6 mb-12 relative z-10">
              <div className="flex-1 bg-rose-500/[0.03] border border-rose-500/10 px-8 py-6 rounded-[2.5rem] flex items-center gap-5 group transition-all hover:bg-rose-500/[0.06]">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60 mb-1">Total Outflow</p>
                  <p className="text-3xl font-black tabular-nums tracking-tighter text-rose-500 truncate">-₱{periodExpense.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex-1 bg-emerald-500/[0.03] border border-emerald-500/10 px-8 py-6 rounded-[2.5rem] flex items-center gap-5 group transition-all hover:bg-emerald-500/[0.06]">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mb-1">Total Inflow</p>
                  <p className="text-3xl font-black tabular-nums tracking-tighter text-emerald-500 truncate">+₱{periodIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full relative z-10">
              {periodExpense === 0 && periodIncome === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-muted/5 rounded-[3rem] border border-dashed border-border/30">
                  <BarChart3 className="w-16 h-16 text-muted-foreground/10 mb-6" />
                  <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">No Live Pattern Data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.03)" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'black', opacity: 0.5 }} 
                      dy={15}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(99, 102, 241, 0.02)', radius: [12, 12, 0, 0] }}
                      content={<CustomTooltip />}
                    />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} onClick={handleBarClick}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={'url(#barGradient)'} className="hover:brightness-125 transition-all" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Timeline Section */}
      <div id="daily-spending-timeline" className="mt-20 space-y-8 scroll-mt-32">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-6">
            <h3 className="text-2xl font-bold tracking-tighter flex items-center gap-4">
              <Timer className="w-6 h-6 text-primary" />
              Transaction Timeline
            </h3>
            {highlightDate && (
              <button 
                onClick={() => setHighlightDate(null)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all bg-muted/40 px-3 py-1.5 rounded-xl border border-border/10"
              >
                <FilterX className="w-3.5 h-3.5" />
                Reset Focus
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowAllTimeline(!showAllTimeline)}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60 hover:text-primary transition-all hover:translate-x-1"
          >
            {showAllTimeline ? "Recent Only" : "Full Timeline"}
          </button>
        </div>

        <div className="relative space-y-4 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-primary/20 before:via-muted/30 before:to-transparent">
          {(() => {
            const filteredTxs = (showAllTimeline ? transactions : transactions.slice(0, 8)).filter(tx => {
              if (!highlightDate) return true;
              
              if (highlightDate.startsWith('W')) {
                const [wPart, yearStr, monthStr] = highlightDate.split('-');
                const weekIdx = parseInt(wPart.replace('W', ''));
                const targetMonth = parseInt(monthStr, 10) - 1;
                const targetYear = parseInt(yearStr, 10);
                const txDate = new Date(tx.date);
                
                if (txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear) {
                  const d = txDate.getDate();
                  let w = 0;
                  if (d <= 7) w = 0; else if (d <= 14) w = 1; else if (d <= 21) w = 2; else w = 3;
                  return w === weekIdx;
                }
                return false;
              }
              return tx.date === highlightDate;
            });

            if (filteredTxs.length === 0) {
              return (
                <div className="pl-14 py-12 text-center bg-muted/5 rounded-[2rem] border border-dashed border-border/20">
                  <p className="text-sm font-black text-muted-foreground/30 uppercase tracking-[0.4em]">No Activity In This Focus Period</p>
                </div>
              );
            }

            return filteredTxs.map((tx) => {
              const Icon = categoryIcons[tx.category] || ShoppingBag;
              const isExpense = tx.type === "expense";
              
              return (
                <div 
                  key={tx.id} 
                  className={cn(
                    "relative pl-14 flex items-center justify-between group transition-all duration-500 py-2",
                    highlightDate && "scale-[1.02] bg-primary/5 rounded-[2rem] pr-6 -mr-6 py-4"
                  )}
                >
                  <div className={cn(
                    "absolute left-[14px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] rounded-full bg-background border-[3px] transition-all duration-500 z-10 shadow-sm",
                    highlightDate ? "border-primary scale-125 bg-primary" : "border-muted group-hover:border-primary/40"
                  )} />
                  
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:scale-110",
                      isExpense ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      <div className={cn(
                        "absolute inset-0 opacity-20 bg-gradient-to-br",
                        isExpense ? "from-rose-500 to-transparent" : "from-emerald-500 to-transparent"
                      )} />
                      <Icon className="w-6 h-6 relative z-10" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold tracking-tight truncate group-hover:text-primary transition-colors">{tx.description || tx.category}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/40 px-2 py-0.5 rounded-lg border border-border/5">
                          {tx.category}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/30">{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className={cn(
                      "text-lg font-bold tabular-nums tracking-tighter",
                      isExpense ? "text-foreground" : "text-emerald-500"
                    )}>
                      {isExpense ? "-" : "+"}₱{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em] mt-1">{tx.accountName}</p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      <AllowanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        allowanceToEdit={selectedAllowance || undefined}
      />

      <QuickDeductModal
        isOpen={isQuickDeductOpen}
        onClose={() => setIsQuickDeductOpen(false)}
        allowance={selectedAllowance}
        onOpenSettings={handleEdit}
      />
      <BumpUpModal 
        isOpen={isBumpUpOpen}
        onClose={() => setIsBumpUpOpen(false)}
        allowance={allowanceToBump}
        onConfirm={(id, date) => {
          reactivateAllowance(id, date);
          setIsBumpUpOpen(false);
        }}
      />
      <SettleAllowanceModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        allowance={allowanceToSettle}
        onConfirm={async (id) => {
          await finishAllowanceEarly(id);
          setIsSettleOpen(false);
        }}
      />
    </div>
  );
}
