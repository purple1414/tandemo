"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  TrendingDown, 
  Target, 
  AlertCircle,
  BrainCircuit,
  User,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/lib/store";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

export function AdvisorPanel() {
  const { isAdvisorOpen, setAdvisorOpen } = useFinanceStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Tandemo Financial Advisor. How can I help you reach your goals today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { transactions, allowances } = useFinanceStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateAdvice = (userQuery: string) => {
    const query = userQuery.toLowerCase();
    
    // Analyze transactions to find the biggest spending leak
    const expenseData = transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseData.reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
    const sortedCategories = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1]);
    const topCategory = sortedCategories[0]?.[0] || "General";
    const topAmount = sortedCategories[0]?.[1] || 0;
    
    if (query.includes("save") && (query.includes("week") || query.includes("day"))) {
      const match = query.match(/(\d+)/);
      const goalAmount = match ? parseInt(match[0]) : 200;
      
      if (goalAmount > 1000) {
        return `₱${goalAmount.toLocaleString()} is a bold goal for this week! Since your ${topCategory} spending is ₱${topAmount.toLocaleString()} lately, you'll need to cut back significantly there. Try limiting ${topCategory} to only essentials for the next 7 days.`;
      }
      
      return `To save ₱${goalAmount} this week, I've identified that you spend the most on "${topCategory}". If you reduce your "${topCategory}" expenses by just 15%, you'll easily reach your ₱${goalAmount} goal by Sunday. I suggest skipping one or two non-essential "${topCategory}" purchases today!`;
    }
    
    if (query.includes("buy") || query.includes("spend")) {
      return `Looking at your current active allowances, you have a surplus of ₱${liveProjectedSavings.toLocaleString()}. You can afford a small purchase, but if you're aiming for a big goal, I'd suggest banking this surplus first.`;
    }

    return `I've analyzed your data. Your biggest spending is currently in "${topCategory}". If you want to save more, we should look at creating a stricter allowance for that category. What do you think?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: generateAdvice(input) 
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  };

  if (!isAdvisorOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end p-4 pointer-events-none">
      <div className="w-full max-w-md h-[600px] glass-card rounded-3xl shadow-2xl border border-primary/20 flex flex-col pointer-events-auto animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tandemo AI Advisor</h3>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Intelligence</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setAdvisorOpen(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                msg.role === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                  : "glass border border-border/50 rounded-tl-none text-foreground"
              )}>
                {msg.content}
              </div>
              <span className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter opacity-50">
                {msg.role === "assistant" ? "Advisor" : "You"}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          )}
        </div>

        {/* Action Suggestions */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-border/10 bg-muted/5">
          {[
            "Save ₱200 this week",
            "Can I buy a new phone?",
            "Expense analysis",
            "Investment tips"
          ].map((s) => (
            <button 
              key={s}
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-[10px] font-bold hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-muted/20 border-t border-border/50">
          <div className="flex gap-2 bg-background/50 border border-border/50 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your advisor anything..."
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:grayscale"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-center text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-40">
            Powered by Tandemo AI Financial Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
