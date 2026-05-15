"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPortal } from "@/components/layout/CommandPortal";

const AUTH_ROUTES = ["/auth", "/login", "/register"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAuthPage) {
    // Auth pages: full-screen, no chrome
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <MobileNav />
      <CommandPortal />
      <main className="flex-1 flex flex-col min-h-screen pt-24 md:pt-0 overflow-x-hidden">
        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
