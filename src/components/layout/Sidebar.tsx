"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  PieChart, 
  Repeat, 
  Settings, 
  Bot,
  UserCircle2,
  ChevronRight,
  ChevronLeft,
  Target,
  Receipt,
  PiggyBank
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalNotifications } from "./GlobalNotifications";
import { useFinanceStore } from "@/lib/store";
import { useAuth } from "../auth/AuthProvider";

const navItems = [
// ...
// Actually, I'll just update the component.
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Tracking", href: "/tracking", icon: Target },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Budgets", href: "/budgets", icon: PieChart, isLocked: true },
  { label: "Savings Goals", href: "/savings", icon: PiggyBank },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "AI Advisor", href: "/ai", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useFinanceStore();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User Name";
  const handle = profile?.username ? `@${profile.username}` : "Premium Partner";

  return (
    <aside 
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "hidden md:flex flex-col h-screen glass border-r border-border/50 sticky top-0 z-50 transition-all duration-500 ease-in-out cursor-pointer group",
        isExpanded ? "w-60 p-5" : "w-16 p-2"
      )}
    >
      <div className="absolute inset-0 bg-black/5 dark:bg-black/10 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Section */}
        <div className={cn("flex items-center mb-8", isExpanded ? "justify-between px-2" : "flex-col gap-6 justify-center")}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
              <Wallet className="text-white w-5 h-5" />
            </div>
            {isExpanded && (
              <span className="text-xl font-black tracking-tighter animate-in fade-in slide-in-from-left-4 duration-500">Tandemo</span>
            )}
          </div>
          
          <div className={cn("flex items-center", !isExpanded && "w-full justify-center")}>
            <GlobalNotifications align="left" />
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map((item: any) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.isLocked ? "#" : item.href}
                onClick={(e) => {
                  if (item.isLocked) {
                    e.preventDefault();
                    alert("This feature is currently under high-fidelity development. Expected release: Q3 2026.");
                    return;
                  }
                  if (!isExpanded) {
                    e.preventDefault();
                    setIsExpanded(true);
                  }
                }}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-300 group/item relative overflow-hidden",
                  isExpanded ? "gap-3 px-3 py-2" : "justify-center w-10 h-10 mx-auto",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : item.isLocked 
                      ? "text-muted-foreground/30 grayscale" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "shrink-0 transition-transform duration-500",
                  isExpanded ? "w-4.5 h-4.5" : "w-5 h-5",
                  isActive ? "text-white" : "group-hover/item:scale-110",
                  item.isLocked && "opacity-30"
                )} />
                {isExpanded && (
                  <span className={cn(
                    "font-bold text-xs tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500",
                    item.isLocked && "opacity-30"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={cn("mt-auto border-t border-border/50 pt-4 space-y-2", isExpanded ? "px-1" : "flex flex-col items-center")}>
          <div className="flex items-center justify-center py-1">
            <ThemeToggle showLabel={isExpanded} />
          </div>

          <Link 
            href="/settings"
            onClick={(e) => {
              if (!isExpanded) {
                e.preventDefault();
                setIsExpanded(true);
              }
            }}
            className={cn(
              "flex items-center rounded-xl transition-all duration-300",
              isExpanded ? "gap-3 px-3 py-2" : "justify-center w-10 h-10 mx-auto",
              pathname === "/settings" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Settings className={cn("w-4.5 h-4.5 shrink-0", !isExpanded && "w-5 h-5")} />
            {isExpanded && (
              <span className="font-bold text-xs tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">Settings</span>
            )}
          </Link>

          <div className={cn(
            "flex items-center rounded-xl bg-muted/30 border border-border/10 transition-all",
            isExpanded ? "gap-3 px-3 py-3" : "justify-center w-10 h-10 mx-auto"
          )}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              <UserCircle2 className="w-6 h-6 text-muted-foreground/30" />
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-11px font-black tracking-tight leading-none truncate">{displayName}</span>
                <span className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1 truncate">{handle}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Indicator */}
      <div className={cn(
        "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-background border border-border/50 rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover:opacity-100",
        isExpanded ? "rotate-180" : ""
      )}>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
