"use client";

import React, { useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { AdvisorPanel } from "./AdvisorPanel";
import { cn } from "@/lib/utils";

export function FloatingAdvisor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-all active:scale-95 group overflow-hidden",
          isOpen && "rotate-90 bg-slate-800"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <Sparkles className="w-7 h-7" />
        ) : (
          <BrainCircuit className="w-7 h-7" />
        )}
      </button>

      <AdvisorPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
