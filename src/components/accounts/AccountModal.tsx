"use client";

import { useState, useEffect } from "react";
import { X, Landmark, Wallet, Banknote, CreditCard, PiggyBank, Save, Trash2 } from "lucide-react";
import { useFinanceStore, Account } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account;
}

const icons = [
  { id: "landmark", label: "Bank", icon: Landmark, type: "Bank" as Account["type"] },
  { id: "wallet", label: "E-wallet", icon: Wallet, type: "E-wallet" as Account["type"] },
  { id: "banknote", label: "Cash", icon: Banknote, type: "Cash" as Account["type"] },
  { id: "creditcard", label: "Credit", icon: CreditCard, type: "Credit" as Account["type"] },
  { id: "piggybank", label: "Savings", icon: PiggyBank, type: "Savings" as Account["type"] },
];

const colors = ["#6366f1", "#007dfe", "#10b981", "#f59e0b", "#ef4444", "#003399"];

export function AccountModal({ isOpen, onClose, accountToEdit }: AccountModalProps) {
  const addAccount = useFinanceStore((state) => state.addAccount);
  const updateAccount = useFinanceStore((state) => state.updateAccount);
  const deleteAccount = useFinanceStore((state) => state.deleteAccount);
  
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<Account["type"]>("Bank");
  const [icon, setIcon] = useState("landmark");
  const [color, setColor] = useState(colors[0]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setBalance(accountToEdit.balance.toString());
      setType(accountToEdit.type);
      setIcon(accountToEdit.icon);
      setColor(accountToEdit.color);
    } else {
      setName("");
      setBalance("");
      setType("Bank");
      setIcon("landmark");
      setColor(colors[0]);
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accData = {
      name,
      balance: parseFloat(balance),
      type,
      icon,
      color,
    };

    if (accountToEdit) {
      updateAccount(accountToEdit.id, accData);
    } else {
      addAccount(accData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (accountToEdit && confirm("Are you sure you want to delete this account?")) {
      deleteAccount(accountToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">
              {accountToEdit ? "Edit Account" : "Link New Account"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Balance (PHP)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold">₱</span>
                <input 
                  required
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-3xl px-12 py-6 text-4xl font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Name</label>
                <input 
                  required
                  placeholder="e.g. BDO Savings, GCash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-muted/50 border border-border rounded-2xl px-5 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  >
                    <option>Bank</option>
                    <option>E-wallet</option>
                    <option>Cash</option>
                    <option>Savings</option>
                    <option>Credit</option>
                    <option>Debt</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Color Theme</label>
                  <div className="flex gap-2 py-1">
                    {colors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          color === c ? "border-foreground scale-110 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Choose Icon</label>
                <div className="grid grid-cols-5 gap-3">
                  {icons.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIcon(item.id);
                        setType(item.type);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
                        icon === item.id 
                          ? "bg-primary/10 border-primary text-primary shadow-sm" 
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {accountToEdit && (
                <button 
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-14 h-14 rounded-2xl border border-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/10 transition-all shrink-0"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
              <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 group">
                {accountToEdit ? "Save Changes" : "Link Account"}
                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Secondary Confirmation Portal */}
      {showConfirmDelete && accountToEdit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 p-8 text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[1.75rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Confirm Liquidation?</h3>
            <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed">
              You are about to permanently delete <span className="text-foreground font-bold">{accountToEdit.name}</span>. This will immediately adjust your <span className="text-foreground font-bold">Net Worth</span> and liquidate all active allowances linked to this asset.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  deleteAccount(accountToEdit.id);
                  setShowConfirmDelete(false);
                  onClose();
                }}
                className="w-full bg-rose-500 text-white py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95"
              >
                Liquidate Account
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="w-full bg-muted text-muted-foreground py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-muted/80 transition-all active:scale-95"
              >
                Abort Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
