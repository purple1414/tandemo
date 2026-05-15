"use client";

import { useState, useEffect } from "react";
import { useFinanceStore, AutomationItem } from "@/lib/store";
import { Plus, Repeat, Calendar as CalendarIcon, List, ArrowUpRight, ArrowDownRight, CreditCard, Bell, ChevronLeft, ChevronRight, History, X, Trash2, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RecurringPage() {
  const accounts = useFinanceStore((state) => state.accounts);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const items = useFinanceStore((state) => state.automations);
  const addAutomation = useFinanceStore((state) => state.addAutomation);
  const updateAutomation = useFinanceStore((state) => state.updateAutomation);
  const deleteAutomation = useFinanceStore((state) => state.deleteAutomation);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedCalendarItem, setSelectedCalendarItem] = useState<AutomationItem | null>(null);
  
  const globalTriggerId = useFinanceStore(state => state.globalTriggerId);
  const setGlobalTriggerId = useFinanceStore(state => state.setGlobalTriggerId);
  
  // Trigger state
  const [triggeringItem, setTriggeringItem] = useState<AutomationItem | null>(null);
  const [actualAmount, setActualAmount] = useState<number>(0);

  const [formData, setFormData] = useState<Partial<AutomationItem>>({
    name: "",
    amount: 0,
    frequency: "Monthly",
    recurrenceCount: null,
    isFixedAmount: false,
    nextDate: new Date().toISOString().split('T')[0],
    type: "expense",
    category: "N/A",
    principalAmount: 0,
    paidAmount: 0,
    accountId: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!editingId) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteAutomation(editingId);
      setIsDeleteConfirmOpen(false);
      setIsModalOpen(false);
    } catch (err: any) {
      setError("Failed to delete automation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModal = (item?: AutomationItem) => {
    setError(null);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        amount: 0,
        frequency: "Monthly",
        recurrenceCount: null,
        isFixedAmount: false,
        nextDate: new Date().toISOString().split('T')[0],
        type: "expense",
        category: "N/A",
        principalAmount: 0,
        paidAmount: 0,
        accountId: accounts.length > 0 ? accounts[0].id : ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.amount) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await updateAutomation(editingId, formData);
      } else {
        await addAutomation(formData as Omit<AutomationItem, "id">);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError("Failed to save automation.");
    } finally {
      setSubmitting(false);
    }
  };

  const executeAutomation = async (item: AutomationItem, amountOverride?: number) => {
    const finalAmount = amountOverride !== undefined ? amountOverride : item.amount;
    const account = accounts.find(a => a.id === item.accountId);
    
    setSubmitting(true);
    try {
      if (account) {
        // Execute the deduction/addition immediately
        await addTransaction({
          date: new Date().toISOString().split('T')[0],
          amount: finalAmount,
          category: item.category,
          account: account.name,
          type: item.type,
          description: `Auto: ${item.name}`,
        });
      } else {
        console.warn("No linked account to deduct/add from.");
      }

      const newCount = item.recurrenceCount !== null ? item.recurrenceCount - 1 : null;
      const newPaidAmount = item.paidAmount !== undefined ? item.paidAmount + finalAmount : undefined;
      
      const dateObj = new Date(item.nextDate);
      if (item.frequency === "Daily") dateObj.setDate(dateObj.getDate() + 1);
      else if (item.frequency === "Weekly") dateObj.setDate(dateObj.getDate() + 7);
      else if (item.frequency === "Monthly") dateObj.setMonth(dateObj.getMonth() + 1);
      else if (item.frequency === "Bi-Monthly") dateObj.setMonth(dateObj.getMonth() + 2);
      else if (item.frequency === "Yearly") dateObj.setFullYear(dateObj.getFullYear() + 1);

      if (newCount !== null && newCount <= 0) {
        await deleteAutomation(item.id);
      } else {
        await updateAutomation(item.id, {
          recurrenceCount: newCount,
          nextDate: dateObj.toISOString().split('T')[0],
          paidAmount: newPaidAmount
        });
      }
    } catch (err: any) {
      console.error("Execution failed:", err);
    } finally {
      setSubmitting(false);
      setTriggeringItem(null);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent, item: AutomationItem) => {
    e.stopPropagation(); // prevent opening edit modal
    if (item.isFixedAmount) {
      executeAutomation(item);
    } else {
      setTriggeringItem(item);
      setActualAmount(item.amount);
    }
  };

  useEffect(() => {
    const today = new Date().getTime();
    
    // Find automations that are due today or in the past, and are fixed amounts
    const dueAutomations = items.filter(item => {
      const itemDate = new Date(item.nextDate).getTime();
      return itemDate <= today && item.isFixedAmount;
    });

    // Auto-execute them
    dueAutomations.forEach(item => {
      executeAutomation(item);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // AI Summary Logic
  const upcomingWeekItems = items.filter(item => {
    const timeDiff = new Date(item.nextDate).getTime() - new Date().getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  });

  const totalNeededNext7Days = upcomingWeekItems.reduce((acc, item) => {
    return item.type === 'expense' ? acc + item.amount : acc;
  }, 0);

  const nextItem = [...items].sort((a,b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())[0];

  useEffect(() => {
    if (globalTriggerId) {
      const item = items.find(i => i.id === globalTriggerId);
      if (item) {
        setSelectedCalendarItem(item);
      }
      setGlobalTriggerId(null);
    }
  }, [globalTriggerId, items, setGlobalTriggerId]);

  return (
    <div className="space-y-8 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring & Automated</h1>
          <p className="text-muted-foreground mt-1">Manage your subscriptions, bills, and scheduled income.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Automation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{viewMode === "list" ? "Upcoming Schedule" : "Payment Calendar"}</h3>
              <div className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                {items.filter(i => i.isFixedAmount).length} Automated
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
                className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 group"
                title={viewMode === "list" ? "Switch to Calendar View" : "Switch to List View"}
              >
                {viewMode === "list" ? (
                  <CalendarIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <List className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {viewMode === "list" ? "Calendar" : "List"}
                </span>
              </button>
            </div>
          </div>

          {viewMode === "calendar" ? (
            <CalendarView items={items} onSelect={setSelectedCalendarItem} />
          ) : (
            <div className="space-y-4">
            {items.sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()).map((item) => {
              // Calculate days until the next due date
              const timeDiff = new Date(item.nextDate).getTime() - new Date().getTime();
              const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              // Determine dynamic card style based on proximity
              let cardStyle = "glass-card hover:border-primary/40";
              if (daysUntil <= 5 && daysUntil >= -30) {
                // Urgent: due within 5 days (or recently overdue)
                cardStyle = item.type === "expense" 
                  ? "bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/50 shadow-lg shadow-rose-500/5" 
                  : "bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5";
              } else if (daysUntil > 15) {
                // Far in the future: typically means it was just paid and rescheduled
                cardStyle = "glass-card opacity-50 grayscale hover:opacity-100 hover:grayscale-0";
              }

              return (
                <div key={item.id} className="group">
                  <div 
                    onClick={() => handleOpenModal(item)}
                    className={cn(
                      "rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all",
                      cardStyle
                    )}
                  >
                    <div>
                      <h4 className="font-bold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.nextDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {item.frequency} 
                        {item.recurrenceCount !== null && ` (${item.recurrenceCount} left)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={cn(
                          "font-bold text-lg",
                          item.type === "income" ? "text-emerald-500" : "text-foreground"
                        )}>
                          {item.type === "income" ? "+" : "-"}₱{item.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                          {item.isFixedAmount ? "Auto-Deduct" : "Confirm Amount"}
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => handleTriggerClick(e, item)}
                        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110"
                        title="Simulate Trigger"
                      >
                        <Play className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {items.length === 0 && (
              <div className="py-8 text-muted-foreground text-sm font-medium">No upcoming automations.</div>
            )}
            </div>
          )}
        </div>

        {/* Debt & Milestones Sidebar */}
        <div className="space-y-8">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 text-foreground">Debt Payoff Tracker</h3>
            <div className="space-y-8">
              {items.filter(i => i.category === 'Debt' || i.category === 'Loan').map((debtItem) => {
                const paid = debtItem.paidAmount || 0;
                const total = debtItem.principalAmount || 1; // prevent div by zero
                const progress = Math.min((paid / total) * 100, 100);
                const colorClass = debtItem.category === 'Debt' ? 'bg-rose-500' : 'bg-amber-500';
                const textClass = debtItem.category === 'Debt' ? 'text-rose-500' : 'text-amber-500';

                return (
                  <div key={debtItem.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-medium ${textClass}`}>{debtItem.name}</span>
                      <span className="font-bold text-foreground">₱{paid.toLocaleString()} / ₱{total.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      {debtItem.recurrenceCount !== null ? (
                        <p className="text-[11px] text-muted-foreground">Payments remaining: <span className="text-foreground font-semibold">{debtItem.recurrenceCount}</span></p>
                      ) : <span />}
                      <p className="text-[11px] text-muted-foreground">Remaining: <span className="text-foreground font-semibold">₱{Math.max(0, total - paid).toLocaleString()}</span></p>
                    </div>
                  </div>
                );
              })}
              {items.filter(i => i.category === 'Debt' || i.category === 'Loan').length === 0 && (
                <div className="text-sm text-muted-foreground">No active debts or loans being tracked.</div>
              )}
            </div>
          </div>

          {/* Summary AI Card */}
          <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 border border-white/20 relative overflow-hidden group">
            {/* Decorative AI Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Repeat className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase">Summary AI</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Weekly Forecast</p>
                <p className="text-3xl font-black tracking-tighter">
                  ₱{totalNeededNext7Days.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs font-bold mt-1">Needed for the next 7 days</p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest text-left">Upcoming Actions</span>
                  <span className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black">{upcomingWeekItems.length} Items</span>
                </div>
                
                {nextItem ? (
                  <div className="p-4 bg-white/10 rounded-[1.5rem] border border-white/10 backdrop-blur-md text-left">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Next Immediate</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-black truncate max-w-[120px]">{nextItem.name}</p>
                        <p className="text-[10px] font-bold text-white/60">Due {new Date(nextItem.nextDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <p className="text-lg font-black tracking-tighter text-white">₱{nextItem.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-white/60 italic">No payments due this week.</p>
                )}
              </div>
              
              <p className="text-[9px] font-bold text-white/40 italic leading-tight text-left">
                AI Tip: Based on your recent activity, we suggest preparing ₱{totalNeededNext7Days.toLocaleString()} to avoid overdraft.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Trigger Confirmation Modal */}
      {triggeringItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] p-8 border border-border/50 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 bg-white text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Confirm Execution</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {triggeringItem.name} requires manual confirmation. How much was actually {triggeringItem.type === "expense" ? "deducted" : "added"}?
            </p>
            
            <input 
              type="number"
              value={actualAmount}
              onChange={(e) => setActualAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-black text-2xl text-center text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all mb-8"
              placeholder="0.00"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setTriggeringItem(null)}
                disabled={submitting}
                className="flex-1 py-4 font-bold rounded-xl bg-muted hover:bg-muted/80 transition-all text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeAutomation(triggeringItem, actualAmount)}
                disabled={submitting}
                className="flex-1 py-4 font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Execute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Quick Action Popup */}
      {selectedCalendarItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedCalendarItem(null)}>
          <div className="w-full max-w-[300px] rounded-[3rem] p-8 border border-border/50 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 bg-white" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-6">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl",
                selectedCalendarItem.type === 'income' ? "bg-emerald-500 text-white" : "bg-muted/50 text-foreground"
              )}>
                 {selectedCalendarItem.type === 'income' ? <ArrowUpRight className="w-10 h-10" /> : <ArrowDownRight className="w-10 h-10" />}
              </div>
              
              <div>
                <h3 className="text-xl font-black tracking-tighter text-foreground leading-tight">{selectedCalendarItem.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">
                  Scheduled Payment
                </p>
              </div>

              <div className="text-3xl font-black tracking-tighter text-foreground">
                {selectedCalendarItem.type === 'income' ? '+' : '-'}₱{selectedCalendarItem.amount.toLocaleString()}
              </div>

              <div className="grid grid-cols-2 gap-4 text-left py-4 border-y border-border/10">
                <div>
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Frequency</p>
                  <p className="text-[10px] font-bold text-foreground mt-0.5">{selectedCalendarItem.frequency}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Category</p>
                  <p className="text-[10px] font-bold text-foreground mt-0.5">{selectedCalendarItem.category}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Type</p>
                  <p className={cn(
                    "text-[10px] font-bold mt-0.5",
                    selectedCalendarItem.type === 'income' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {selectedCalendarItem.type === 'income' ? 'Addition' : (selectedCalendarItem.category === 'Debt' || selectedCalendarItem.category === 'Loan' ? 'Debt Payoff' : 'Deduction')}
                  </p>
                </div>
                {selectedCalendarItem.recurrenceCount !== null && (
                  <div>
                    <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em]">Remaining</p>
                    <p className="text-[10px] font-bold text-foreground mt-0.5">{selectedCalendarItem.recurrenceCount} left</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => {
                    handleTriggerClick({ stopPropagation: () => {} } as any, selectedCalendarItem);
                    setSelectedCalendarItem(null);
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  {selectedCalendarItem.type === 'income' ? 'Receive Amount' : 
                   (selectedCalendarItem.category === 'Debt' || selectedCalendarItem.category === 'Loan' ? `Pay ₱${selectedCalendarItem.amount.toLocaleString()}` : 
                   (selectedCalendarItem.category === 'Savings' ? `Save ₱${selectedCalendarItem.amount.toLocaleString()}` : `Deduct ₱${selectedCalendarItem.amount.toLocaleString()}`))}
                </button>
                <button 
                  onClick={() => setSelectedCalendarItem(null)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automation Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 border border-border/50 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tighter text-foreground">{editingId ? "Edit Automation" : "New Automation"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="e.g. Spotify Family Plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Expected Amount (₱)</label>
                  <input 
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Next Due Date</label>
                  <input 
                    type="date"
                    value={formData.nextDate}
                    onChange={(e) => setFormData({...formData, nextDate: e.target.value})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Frequency</label>
                  <select 
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value as AutomationItem["frequency"]})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-Monthly">Bi-Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Total Recurrences</label>
                  <input 
                    type="number"
                    value={formData.recurrenceCount ?? ""}
                    onChange={(e) => setFormData({...formData, recurrenceCount: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder="Infinite"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as "income" | "expense"})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="expense">Expense (Deduct)</option>
                    <option value="income">Income (Add)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="N/A">N/A</option>
                    <option value="Debt">Debt</option>
                    <option value="Loan">Loan</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
              </div>

              {(formData.category === "Debt" || formData.category === "Loan") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Principal Total (₱)</label>
                    <input 
                      type="number"
                      value={formData.principalAmount || ""}
                      onChange={(e) => setFormData({...formData, principalAmount: parseFloat(e.target.value) || 0})}
                      className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Amount Paid (₱)</label>
                    <input 
                      type="number"
                      value={formData.paidAmount || ""}
                      onChange={(e) => setFormData({...formData, paidAmount: parseFloat(e.target.value) || 0})}
                      className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Linked Account</label>
                  <select 
                    value={formData.accountId}
                    onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                    className="w-full mt-2 bg-muted/30 border border-border/50 rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select an account...</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (₱{acc.balance.toLocaleString()})</option>
                    ))}
                    {accounts.length === 0 && (
                      <option value="" disabled>No accounts available</option>
                    )}
                  </select>
                </div>
                
                <label className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-muted/10 cursor-pointer hover:bg-muted/30 transition-all">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={formData.isFixedAmount}
                      onChange={(e) => setFormData({...formData, isFixedAmount: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-muted-foreground/30 rounded-full peer peer-checked:bg-primary transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Fixed Amount</p>
                    <p className="text-[10px] text-muted-foreground">If disabled, the system will ask you to confirm the exact amount on due date.</p>
                  </div>
                </label>
              </div>

              {error && <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest text-center">{error}</p>}
              <div className="flex gap-4 mt-8">
                {editingId && (
                  <button 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={submitting}
                    className="aspect-square px-6 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={submitting || !formData.name || !formData.amount}
                  className={cn(
                    "bg-primary text-primary-foreground font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50",
                    editingId ? "flex-1" : "w-full"
                  )}
                >
                  {submitting ? "SYNCHRONIZING..." : (editingId ? "SAVE" : "Create Automation")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[2rem] p-8 border border-border/50 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 bg-white text-center">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">Delete Automation?</h3>
            <p className="text-sm text-muted-foreground mb-8">
              This action cannot be undone. Are you sure you want to remove this automation from your schedule?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={submitting}
                className="flex-1 py-4 font-bold rounded-xl bg-muted hover:bg-muted/80 transition-all text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-4 font-bold rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ items, onSelect }: { items: AutomationItem[], onSelect: (item: AutomationItem) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="glass-card rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-500 border border-border/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black tracking-tighter uppercase text-foreground">
            {currentDate.toLocaleString('default', { month: 'long' })}
          </h3>
          <p className="text-sm font-bold text-muted-foreground tracking-[0.2em]">{year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-3 bg-muted/50 hover:bg-primary hover:text-white rounded-2xl transition-all active:scale-90">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-3 bg-muted/50 hover:bg-primary hover:text-white rounded-2xl transition-all active:scale-90">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-center text-muted-foreground/50">
            {day}
          </div>
        ))}
        
        {blanks.map(b => (
          <div key={`blank-${b}`} className="min-h-[100px] rounded-2xl bg-muted/5 border border-dashed border-border/20" />
        ))}
        
        {days.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayItems = items.filter(i => i.nextDate === dateStr);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div key={day} className={cn(
              "min-h-[120px] p-3 rounded-2xl border transition-all hover:bg-muted/10 group/day",
              isToday ? "bg-primary/[0.03] border-primary/30" : "bg-muted/10 border-border/30",
              dayItems.length > 0 && "ring-1 ring-inset ring-primary/20"
            )}>
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                  isToday ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : "text-muted-foreground group-hover/day:text-foreground"
                )}>
                  {day}
                </span>
                {dayItems.length > 0 && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <div className="space-y-1.5">
                {dayItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={cn(
                      "w-full text-left p-2 rounded-xl text-[9px] font-bold truncate transition-all hover:scale-[1.05] active:scale-95 shadow-sm",
                      item.type === 'income' ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-900 border border-border/50 text-foreground"
                    )}
                  >
                    {item.type === 'income' ? '+' : '-'}₱{item.amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
