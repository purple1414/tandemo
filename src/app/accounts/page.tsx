"use client";

import { useState } from "react";
import { useFinanceStore, Account } from "@/lib/store";
import { Plus, Landmark, Wallet, Banknote, CreditCard, PiggyBank, Settings2, Smile, Frown, Meh, PieChart as PieChartIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AccountModal } from "@/components/accounts/AccountModal";

const icons: Record<string, any> = {
  landmark: Landmark,
  wallet: Wallet,
  banknote: Banknote,
  creditcard: CreditCard,
  piggybank: PiggyBank,
};

export default function AccountsPage() {
  const accounts = useFinanceStore((state) => state.accounts);
  const deleteAccount = useFinanceStore((state) => state.deleteAccount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };



  const chartData = accounts.map(acc => ({
    name: acc.name,
    value: acc.balance,
    color: acc.color
  }));

  // Dynamic status logic
  const getStatus = (amount: number) => {
    if (amount < 5000) return "low";
    if (amount < 20000) return "normal";
    return "high";
  };

  const [filterType, setFilterType] = useState<string | null>(null);

  const isCredit = (type: string) => {
    const t = type.toLowerCase();
    return t === "credit" || t === "debt" || t === "credit card";
  };

  const creditTotal = accounts
    .filter(acc => isCredit(acc.type))
    .reduce((sum, acc) => sum + acc.balance, 0);

  const debitTotal = accounts
    .filter(acc => !isCredit(acc.type))
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalNetWorth = debitTotal + creditTotal;

  const netStatus = getStatus(totalNetWorth);
  
  const statusGradients = {
    low: "from-rose-500 via-rose-600 to-ruby-700 shadow-rose-500/30",
    normal: "from-indigo-600 via-violet-600 to-purple-700 shadow-indigo-500/30",
    high: "from-emerald-500 via-teal-600 to-cyan-700 shadow-emerald-500/30",
  };

  const filteredAccounts = accounts.filter(acc => {
    if (!filterType) return true;
    if (filterType === "Credit") return isCredit(acc.type);
    if (filterType === "Debit") return !isCredit(acc.type);
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your banks, e-wallets, and savings.</p>
        </div>
        
        <button 
          onClick={handleAdd}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 md:px-4 md:py-2.5 bg-primary text-white rounded-2xl md:rounded-xl text-lg md:text-sm font-black md:font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4" />
          Link New Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unified Asset Card */}
        <div className="lg:col-span-3">
          <div className={cn(
            "glass-card rounded-[3.5rem] p-8 lg:p-14 text-white relative overflow-hidden shadow-2xl transition-all duration-1000 bg-gradient-to-br min-h-[550px] border-white/20",
            statusGradients[netStatus]
          )}>
            {/* Dynamic Mesh Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-black/20 rounded-full blur-[100px] animate-bounce-slow pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-white/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />

            {/* Background Shape - Subtle Glass Overlay */}
            <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 backdrop-blur-3xl rounded-l-[6rem] pointer-events-none border-l border-white/10" />

            <div className="flex flex-col gap-12 relative z-10">
              {/* Top Row: Executive Summary Horizon */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                <div 
                  className="lg:col-span-2 bg-white/75 backdrop-blur-[40px] rounded-[3.5rem] p-10 border border-white shadow-xl shadow-black/5 relative overflow-hidden group/nw flex items-center gap-8 min-w-0 transition-all duration-700 hover:shadow-2xl h-full"
                  style={{ containerType: 'inline-size' }}
                >
                  {/* Subtle Shine */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                  
                  {(() => {
                    const StatusIcon = netStatus === "low" ? Frown : netStatus === "high" ? Smile : Meh;
                    return (
                      <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-white/30 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                          <StatusIcon className="w-10 h-10 text-amber-950 stroke-[2.5px]" />
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex flex-col gap-1 min-w-0 flex-1 overflow-hidden">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] leading-none">Net Worth</p>
                    <h2 className="text-[clamp(1.2rem,11cqw,3.5rem)] font-black tracking-tighter text-slate-900 tabular-nums leading-none whitespace-nowrap overflow-hidden">
                      ₱{totalNetWorth.toLocaleString()}
                    </h2>
                  </div>
                </div>

                <div 
                  onClick={() => setFilterType(filterType === "Credit" ? null : "Credit")}
                  className={cn(
                    "bg-white/75 border shadow-xl shadow-black/5 backdrop-blur-[40px] rounded-[3.5rem] p-10 transition-all duration-500 group/stat h-full flex flex-col justify-center cursor-pointer hover:scale-[1.02]",
                    filterType === "Credit" ? "border-primary ring-2 ring-primary/20" : "border-white"
                  )}
                >
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Credit Cards</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">₱{creditTotal.toLocaleString()}</p>
                  <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-pulse" style={{ width: `${Math.min(100, (creditTotal / (Math.abs(totalNetWorth) || 1)) * 100)}%` }} />
                  </div>
                </div>

                <div 
                  onClick={() => setFilterType(filterType === "Debit" ? null : "Debit")}
                  className={cn(
                    "bg-white/75 border shadow-xl shadow-black/5 backdrop-blur-[40px] rounded-[3.5rem] p-10 transition-all duration-500 group/stat h-full flex flex-col justify-center cursor-pointer hover:scale-[1.02]",
                    filterType === "Debit" ? "border-primary ring-2 ring-primary/20" : "border-white"
                  )}
                >
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Debit Cards</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">₱{debitTotal.toLocaleString()}</p>
                  <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 animate-pulse" style={{ width: `${Math.min(100, (debitTotal / (Math.abs(totalNetWorth) || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Analytics Deck */}
              <div className="w-full">
                <div className="bg-white/75 backdrop-blur-[40px] rounded-[4rem] p-10 lg:p-14 border border-white overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] transition-all duration-700">
                  {/* Subtle Top Shine */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-100 to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-center mb-12 relative z-10">
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                      <Settings2 className="w-6 h-6 text-slate-400" />
                      Asset Allocation
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 relative h-[380px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={95}
                            outerRadius={125}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={4}
                            animationDuration={1800}
                            animationEasing="ease-out"
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                className="hover:opacity-90 transition-all cursor-pointer" 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: '1px solid rgba(0,0,0,0.05)', 
                              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                              backgroundColor: 'rgba(255, 255, 255, 0.98)',
                              backdropFilter: 'blur(20px)',
                              padding: '16px 20px',
                              color: '#09090b',
                              fontWeight: '700',
                              fontSize: '14px'
                            }}
                            cursor={{ fill: 'transparent' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 px-2 text-center lg:text-left">Holdings</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                        {chartData.map((item, i) => {
                          const isLightColor = item.color.includes('emerald') || item.color.includes('teal') || item.color.includes('yellow');
                          return (
                            <div 
                              key={i} 
                              className={cn(
                                "flex items-center gap-4 px-6 py-3 rounded-full transition-all hover:scale-[1.02] shadow-md",
                                isLightColor ? "text-slate-900" : "text-white"
                              )}
                              style={{ backgroundColor: item.color }}
                            >
                              <span className="text-xl font-black tabular-nums tracking-tight">
                                {((item.value / totalNetWorth) * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 leading-tight">
                                {item.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                {filterType ? `${filterType} Accounts` : "All Accounts"}
              </h3>
              {filterType && (
                <button 
                  onClick={() => setFilterType(null)}
                  className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Live Sync</span>
            </div>
          </div>
          {filteredAccounts.map((acc) => {
            const Icon = icons[acc.icon] || Landmark;
            const accountStatus = acc.balance < 2000 ? "low" : acc.balance < 10000 ? "normal" : "high";
            const statusEmoji = accountStatus === "low" ? "☹️" : accountStatus === "high" ? "😎" : "😐";

            return (
              <div 
                key={acc.id} 
                className="glass-card rounded-[2.5rem] p-6 flex items-center gap-6 hover:border-primary/40 transition-all group cursor-pointer border border-white/10 shadow-lg"
                onClick={() => handleEdit(acc)}
              >
                <div 
                  className="w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shrink-0 shadow-xl group-hover:scale-105 transition-all relative"
                  style={{ backgroundColor: acc.color }}
                >
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xl group-hover:text-primary transition-colors truncate tracking-tight">{acc.name}</h4>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-1">{acc.type}</p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "text-2xl font-black tabular-nums tracking-tighter",
                    accountStatus === "low" ? "text-rose-500" : "text-foreground"
                  )}>
                    ₱{acc.balance.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1 opacity-40">+2.3% active</p>
                </div>

                <div className="flex gap-2 ml-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(acc);
                    }}
                    className="w-12 h-12 bg-muted rounded-2xl transition-all hover:bg-primary hover:text-white flex items-center justify-center shadow-sm"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        accountToEdit={editingAccount}
      />
    </div>
  );
}
