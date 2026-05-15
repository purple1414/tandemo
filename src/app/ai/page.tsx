"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles, BrainCircuit, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/lib/store";

const suggestions = [
  "Can we afford a car loan?",
  "How should we budget our salary?",
  "Analyze our grocery spending",
  "How to pay off debt faster?"
];

export default function AIDashboard() {
  const { accounts, transactions, savingsGoals, automations } = useFinanceStore();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your Tandemo AI Financial Supervisor. I've analyzed your live financial data. How can I help you optimize your capital today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);

  const generateAIResponse = (userQuery: string) => {
    const query = userQuery.toLowerCase();
    
    if (query.includes("balance") || query.includes("how much money")) {
      return `Based on your linked accounts, your current total liquidity is ₱${totalBalance.toLocaleString()}. You have ${accounts.length} active funding sources. Your largest holding is in ${accounts.sort((a,b) => b.balance - a.balance)[0]?.name || 'N/A'}.`;
    }
    
    if (query.includes("saving") || query.includes("goal")) {
      const topGoal = savingsGoals[0];
      if (!topGoal) return "You haven't set any strategic savings goals yet. Should we initialize one now?";
      const progress = (totalSaved / totalTarget) * 100;
      return `You've accumulated ₱${totalSaved.toLocaleString()} across your goals, which is ${progress.toFixed(1)}% of your ₱${totalTarget.toLocaleString()} target. Your "${topGoal.name}" goal is currently at ${((topGoal.currentAmount / topGoal.targetAmount) * 100).toFixed(1)}%.`;
    }

    if (query.includes("bill") || query.includes("recurring") || query.includes("pay")) {
      const upcoming = automations.length;
      return `You have ${upcoming} active automations scheduled. The next immediate requirement is for "${automations[0]?.name || 'N/A'}" due on ${automations[0]?.nextDate || 'N/A'}.`;
    }

    if (query.includes("debt") || query.includes("loan")) {
      const debts = automations.filter(a => a.category === 'Debt' || a.category === 'Loan');
      const totalDebt = debts.reduce((acc, d) => acc + (d.principalAmount || 0) - (d.paidAmount || 0), 0);
      return `Your current tracked debt exposure is ₱${totalDebt.toLocaleString()} across ${debts.length} liabilities. I recommend utilizing the surplus from your ${accounts[0]?.name || 'primary account'} to accelerate your payoff strategy.`;
    }

    return "That's a complex strategic question. Analyzing your transaction history, I suggest optimizing your cash flow by 15% this month to ensure you meet your upcoming goals without impacting your liquidity.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages([...messages, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateAIResponse(userMsg);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-8 pb-8">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col glass-card rounded-[3rem] overflow-hidden border border-border/50 shadow-2xl bg-white/50 backdrop-blur-xl">
        <div className="p-6 border-b border-border/30 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="text-white w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">Financial Supervisor</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Deep Context Engine Active</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "flex items-start gap-4 max-w-[85%] md:max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                msg.role === "assistant" ? "bg-primary/10 text-primary" : "bg-primary shadow-lg shadow-primary/20"
              )}>
                {msg.role === "assistant" ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5 text-white" />}
              </div>
              <div className={cn(
                "p-4 md:p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                msg.role === "assistant" 
                  ? "bg-slate-100/80 text-slate-900 rounded-tl-none border-none" 
                  : "bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground ml-14">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest ml-2">Analyzing your strategy...</span>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-border/50 space-y-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s)}
                className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-border/50 px-4 py-2 rounded-full hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all text-slate-600"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your balance, goals, or upcoming bills..." 
              className="w-full bg-slate-50 border border-border/50 rounded-[2rem] px-6 py-5 pr-16 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm shadow-inner"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2.5 top-2.5 bottom-2.5 w-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-90 shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Stats Sidebar - Grayed Out (Under Development) */}
      <div className="w-full lg:w-80 space-y-8 overflow-y-auto pr-2 custom-scrollbar grayscale opacity-50 pointer-events-none select-none relative">
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/10 backdrop-blur-[2px] px-4 py-2 rounded-full border border-slate-900/10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Coming Soon</span>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-6 relative overflow-hidden bg-white border border-border/50 shadow-xl">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Financial Health Index</h4>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.85)} className="text-primary transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black tracking-tighter">85</span>
                <span className="text-[8px] font-black uppercase text-primary tracking-widest">Score</span>
              </div>
            </div>
            <p className="mt-4 font-black text-xl text-slate-900 tracking-tight">Very Healthy</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 text-center leading-relaxed">
              Based on your ₱${totalBalance.toLocaleString()} liquidity vs ₱${totalTarget.toLocaleString()} goal targets.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-4">Live Context Engine</h4>
          
          <div className="bg-white rounded-[2rem] p-5 flex items-start gap-3 border border-border/50 hover:border-primary/20 transition-all cursor-pointer group shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Zap className="text-amber-500 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Liquidity Alert</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">Your balance in {accounts[0]?.name} is sufficient for all goals.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 flex items-start gap-3 border border-border/50 hover:border-primary/20 transition-all cursor-pointer group shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <BrainCircuit className="text-emerald-500 w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Goal Projection</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed">You are ${((totalSaved / totalTarget) * 100).toFixed(0)}% towards your combined financial targets.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] p-8 bg-primary/5 border border-primary/20">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6">Strategic Coaching</h4>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-500 uppercase tracking-tighter">Goal Count</span>
              <span className="font-black text-slate-900">{savingsGoals.length} Active</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-500 uppercase tracking-tighter">Net Liquidity</span>
              <span className="font-black text-emerald-600">₱{totalBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-500 uppercase tracking-tighter">Savings Rate</span>
              <span className="font-black text-slate-900">35% (Great)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
