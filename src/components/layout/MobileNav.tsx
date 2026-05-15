"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Wallet, 
  LayoutDashboard, 
  History, 
  PieChart, 
  Repeat, 
  Bot, 
  Settings,
  UserCircle2,
  Target,
  Receipt,
  PiggyBank
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalNotifications } from "./GlobalNotifications";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Tracking", href: "/tracking", icon: Target },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Savings Goals", href: "/savings", icon: PiggyBank },
  { label: "Budgets", href: "/budgets", icon: PieChart, isLocked: true },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "AI Advisor", href: "/ai", icon: Bot },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Smart Header Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // ONLY show at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar on path change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header Bar */}
      <header 
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 h-20 glass border-b border-border/50 z-[60] px-6 flex items-center justify-between transition-transform duration-500",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Tandemo</span>
        </div>

        <div className="flex items-center gap-2">
          <GlobalNotifications />
          <button 
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center active:scale-90 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-md z-[70] transition-opacity duration-500",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <aside 
        className={cn(
          "fixed top-0 right-0 bottom-0 w-[85%] max-w-sm glass z-[80] transition-transform duration-500 ease-out border-l border-border/50 p-8 flex flex-col overflow-y-auto scrollbar-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Menu</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item: any) => {
            const isActive = pathname === item.href;
            const isAI = item.label === "AI Advisor";
            
            return (
              <Link
                key={item.href}
                href={item.isLocked ? "#" : item.href}
                onClick={(e) => {
                  if (item.isLocked) {
                    e.preventDefault();
                    alert("This feature is currently under high-fidelity development. Expected release: Q3 2026.");
                  }
                }}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : isAI
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95"
                      : item.isLocked
                        ? "text-muted-foreground/30 grayscale"
                        : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-6 h-6", (isActive || isAI) ? "text-white" : "", item.isLocked && "opacity-30")} />
                <span className={cn("font-bold text-base", item.isLocked && "opacity-30")}>{item.label}</span>
                {isAI && (
                  <div className="ml-auto bg-white/20 px-2 py-0.5 rounded-md">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Pro</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-12 pt-12 border-t border-border/50">
          <div className="flex items-center justify-between mb-8 px-2">
            <ThemeToggle showLabel={true} />
          </div>
          
          <Link 
            href="/settings"
            className={cn(
              "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all mb-4",
              pathname === "/settings" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Settings className="w-6 h-6" />
            <span className="font-bold text-base">Settings</span>
          </Link>

          <div className="flex items-center gap-4 px-4 py-4 bg-muted/30 rounded-[2rem] border border-border/10">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              <UserCircle2 className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight leading-none">User Name</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Premium Partner</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
