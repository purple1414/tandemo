"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  PieChart, 
  Repeat,
  Plus,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModals } from "@/components/layout/ModalProvider";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Tracking", href: "/tracking", icon: History },
  { label: "AI Advisor", href: "/ai", icon: Bot },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openTransactionModal } = useModals();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass border-t border-border px-6 flex items-center justify-between z-50 pb-safe">
      {navItems.slice(0, 2).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "scale-110")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      <button 
        onClick={openTransactionModal}
        className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center -mt-10 shadow-lg shadow-primary/40 border-4 border-background active:scale-95 transition-transform"
      >
        <Plus className="text-white w-8 h-8" />
      </button>

      {navItems.slice(2, 4).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "scale-110")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
