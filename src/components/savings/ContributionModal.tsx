"use client";

import { useState } from "react";
import { X, Wallet, Landmark, Banknote, ArrowRight, CheckCircle2, Target, Settings, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinanceStore, SavingsGoal } from "@/lib/store";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export default function ContributionModal({ isOpen, onClose, goal }: ContributionModalProps) {
  const { accounts, contributeToGoal, updateSavingsGoal, deleteSavingsGoal } = useFinanceStore();
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editTargetAcc, setEditTargetAcc] = useState("");
  const [editDeductAcc, setEditDeductAcc] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync edit fields when entering edit mode
  const handleToggleEdit = () => {
    if (!isEditing && goal) {
      setEditName(goal.name);
      setEditTarget(goal.targetAmount.toString());
      setEditTargetAcc(goal.targetAccountId);
      setEditDeductAcc(goal.deductionAccountId);
    }
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleUpdate = async () => {
    if (!goal) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateSavingsGoal(goal.id, {
        name: editName,
        targetAmount: parseFloat(editTarget),
        targetAccountId: editTargetAcc,
        deductionAccountId: editDeductAcc
      });
      setIsEditing(false);
    } catch (err: any) {
      setError("Failed to update strategy.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    setSubmitting(true);
    try {
      await deleteSavingsGoal(goal.id);
      onClose();
    } catch (err: any) {
      setError("Failed to decommission goal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !goal) return null;

  const handleContribute = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await contributeToGoal(goal.id, numAmount, selectedAccountId);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError("Capital injection failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const remainingToGoal = goal.targetAmount - goal.currentAmount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-all duration-500"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] p-1 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-300 bg-white border border-border/50 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="text-left pr-12 md:pr-0">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter">{isEditing ? "Manage Strategy" : "Goal Contribution"}</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                {isEditing ? "Modify Goal Parameters" : "Strategic Capital Injection"}
              </p>
            </div>
            <div className="absolute top-6 right-6 md:static flex items-center gap-2">
              <button 
                onClick={handleToggleEdit}
                className={cn(
                  "w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all border border-border/10",
                  isEditing ? "bg-primary text-white" : "bg-muted/40 hover:bg-muted"
                )}
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={onClose}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors border border-border/10"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-emerald-500">Contribution Success</h3>
                <p className="text-sm text-muted-foreground font-bold mt-2 italic">Capital successfully deployed to "{goal.name}"</p>
              </div>
            </div>
          ) : isEditing ? (
            <div className="space-y-6 text-left animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Goal Name</label>
                <input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-muted/40 border border-border/10 rounded-2xl py-4 px-6 text-xl font-black tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Target Amount</label>
                <input 
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="w-full bg-muted/40 border border-border/10 rounded-2xl py-4 px-6 text-xl font-black tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Save To</label>
                  <select 
                    value={editTargetAcc}
                    onChange={(e) => setEditTargetAcc(e.target.value)}
                    className="w-full bg-muted/40 border border-border/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Deduct From</label>
                  <select 
                    value={editDeductAcc}
                    onChange={(e) => setEditDeductAcc(e.target.value)}
                    className="w-full bg-muted/40 border border-border/10 rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-3">
                {error && <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest text-center">{error}</p>}
                <div className="flex gap-3">
                  <button 
                    onClick={handleDelete}
                    disabled={submitting}
                    className="aspect-square px-6 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-500/20 disabled:opacity-50"
                    title="Decommission Goal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={submitting}
                    className="flex-1 py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? "SYNCHRONIZING..." : "SAVE"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {/* Goal Context */}
              <div className="p-6 bg-muted/30 rounded-[2rem] border border-border/10 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-white shadow-lg")}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Goal</p>
                      <h3 className="text-base font-black tracking-tight">{goal.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Remaining</p>
                    <p className="text-base font-black tracking-tight">₱{remainingToGoal.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Contribution Amount</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/40 group-focus-within:text-primary transition-colors">₱</div>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-muted/40 border border-border/10 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black tracking-tighter focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-20"
                  />
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-4 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Funding Source</label>
                <div className="grid grid-cols-1 gap-3">
                  {accounts.map((acc) => {
                    const isTarget = acc.id === goal.targetAccountId;
                    return (
                      <button
                        key={acc.id}
                        disabled={isTarget}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex items-center justify-between group/acc relative overflow-hidden",
                          selectedAccountId === acc.id 
                            ? "bg-primary/5 border-primary/40 shadow-lg shadow-primary/5" 
                            : "bg-muted/20 border-border/10 hover:border-border/40",
                          isTarget && "opacity-30 grayscale cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all",
                            selectedAccountId === acc.id ? "scale-110 shadow-lg" : "opacity-40"
                          )} style={{ backgroundColor: acc.color }}>
                            {acc.type === "Bank" ? <Landmark className="w-5 h-5" /> : acc.type === "E-wallet" ? <Wallet className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black tracking-tight">{acc.name}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{acc.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isTarget ? (
                            <span className="text-[8px] font-black bg-muted px-2 py-1 rounded-md uppercase tracking-widest text-muted-foreground border border-border/50">Target Account</span>
                          ) : (
                            <>
                              <p className={cn(
                                "text-sm font-black tracking-tighter transition-colors",
                                selectedAccountId === acc.id ? "text-primary" : "text-muted-foreground"
                              )}>₱{acc.balance.toLocaleString()}</p>
                              <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Available</p>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest text-center mb-4">{error}</p>}

              {/* Action Button */}
              <button 
                onClick={handleContribute}
                disabled={submitting || !amount || parseFloat(amount) <= 0 || (selectedAccount && selectedAccount.balance < parseFloat(amount))}
                className="w-full py-5 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3 group"
              >
                {submitting ? (
                  "DEPLOYING CAPITAL..."
                ) : (
                  <>
                    Inject Capital <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
