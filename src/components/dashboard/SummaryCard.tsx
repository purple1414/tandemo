import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank, Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  change?: number;
  icon: "wallet" | "trend" | "card" | "savings";
  className?: string;
}

const icons = {
  wallet: Wallet,
  trend: TrendingUp,
  card: CreditCard,
  savings: PiggyBank,
};

export function SummaryCard({ title, amount, change, icon, className }: SummaryCardProps) {
  const Icon = icons[icon];
  const isPositive = change && change > 0;
  
  const isNetWorth = title === "Net Worth";
  
  // Dynamic status for Net Worth
  const status = isNetWorth ? (
    amount < 5000 ? "low" : amount < 20000 ? "normal" : "high"
  ) : "none";

  const StatusIcon = status === "low" ? Frown : status === "high" ? Smile : Meh;
  
  const statusColors = {
    low: "from-rose-500 to-rose-600 shadow-rose-500/20",
    normal: "from-indigo-500 to-violet-600 shadow-indigo-500/20",
    high: "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    none: ""
  };

  if (isNetWorth) {
    return (
      <div className={cn(
        "relative p-8 rounded-[2.5rem] flex flex-col gap-6 text-white overflow-hidden transition-all duration-700 shadow-2xl",
        statusColors[status],
        "bg-gradient-to-br",
        className
      )}>
        {/* Abstract Glow Decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-60">{title}</p>
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-white/20">
            <StatusIcon className="w-7 h-7 text-amber-950 stroke-[2.5px]" />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-4xl font-black tracking-tighter tabular-nums mb-1">
            ₱{amount.toLocaleString()}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="px-3 py-1 rounded-full bg-black/10 border border-white/10 flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 opacity-60" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Across accounts</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-6 rounded-3xl flex flex-col gap-4 min-w-[240px] border border-white/10 shadow-xl", className)}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon className="text-primary w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm",
            isPositive ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{title}</p>
        <h3 className="text-2xl font-black tracking-tight mt-1 tabular-nums">₱{amount.toLocaleString()}</h3>
      </div>
    </div>
  );
}
