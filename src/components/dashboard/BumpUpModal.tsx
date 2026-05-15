"use client";

import { useState } from "react";
import { X, Calendar, Clock, ArrowUpCircle } from "lucide-react";
import { Allowance } from "@/lib/store";
import { cn } from "@/lib/utils";

interface BumpUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowance: Allowance | null;
  onConfirm: (id: string, newEndDate: string) => void;
}

export function BumpUpModal({ isOpen, onClose, allowance, onConfirm }: BumpUpModalProps) {
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOption, setSelectedOption] = useState<string>("1day");

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !allowance) return null;

  const handleConfirm = async () => {
    let finalDate = "";
    const now = new Date();
    
    if (selectedOption === "1day") {
      now.setDate(now.getDate() + 1);
      finalDate = now.toISOString().split('T')[0];
    } else if (selectedOption === "2days") {
      now.setDate(now.getDate() + 2);
      finalDate = now.toISOString().split('T')[0];
    } else if (selectedOption === "1week") {
      now.setDate(now.getDate() + 7);
      finalDate = now.toISOString().split('T')[0];
    } else {
      finalDate = customDate;
    }

    setSubmitting(true);
    try {
      await onConfirm(allowance.id, finalDate);
      onClose();
    } catch (err) {
      console.error("Bump up failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    { id: "1day", label: "+1 Day", icon: Clock },
    { id: "2days", label: "+2 Days", icon: Clock },
    { id: "1week", label: "+1 Week", icon: Calendar },
    { id: "custom", label: "Custom", icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-border/10">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight">Bump Up</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Select New End Date</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 group",
                    selectedOption === opt.id 
                      ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10" 
                      : "bg-muted/30 border-transparent hover:border-border text-muted-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", selectedOption === opt.id ? "animate-bounce" : "")} />
                  <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {selectedOption === "custom" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Specified Date</label>
              <input 
                type="date"
                value={customDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            </div>
          )}

          <button 
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? "Reactivating Strategy..." : "Confirm Reactivation"}
            <ArrowUpCircle className={cn("w-6 h-6", submitting && "animate-bounce")} />
          </button>
        </div>
      </div>
    </div>
  );
}
