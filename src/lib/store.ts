import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { formatLocalDate } from "./date-utils";

export type AutomationItem = {
  id: string;
  name: string;
  amount: number;
  frequency: "Daily" | "Weekly" | "Monthly" | "Bi-Monthly" | "Yearly" | "Custom";
  recurrenceCount: number | null;
  isFixedAmount: boolean;
  nextDate: string;
  type: "income" | "expense";
  category: "Debt" | "Loan" | "Savings" | "N/A" | string;
  principalAmount?: number;
  paidAmount?: number;
  accountId: string;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  account: string;        // frontend camelCase field (maps to account_name in DB)
  type: "income" | "expense";
  description: string;
  allowanceName?: string; // maps to allowance_name in DB
  recurring?: boolean;
};

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetAccountId: string;
  deductionAccountId: string;
}

export type Account = {
  id: string;
  name: string;
  type: "Bank" | "E-wallet" | "Cash" | "Savings" | "Credit" | "Debt";
  balance: number;
  color: string;
  icon: string;
};

export type Budget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category: string;
  period: "monthly" | "weekly";
};

export type Allowance = {
  id: string;
  name: string;
  amount: number;
  frequency: "Day" | "Week" | "Month" | "Bi-Month" | "Year" | "Custom";
  spent: number;
  accountId?: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired";
  color?: string;
};

export type SavingGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  category: string;
  color: string;
  deadline: string;
};

interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  allowances: Allowance[];
  goals: SavingGoal[];
  automations: AutomationItem[];
  savingsGrowth: number;
  householdId: string | null;
  
  // Actions
  setHouseholdId: (id: string) => void;
  setInitialData: (data: Partial<FinanceState>) => void;
  addAutomation: (item: Omit<AutomationItem, "id">) => void;
  updateAutomation: (id: string, item: Partial<AutomationItem>) => void;
  deleteAutomation: (id: string) => void;
  globalTriggerId: string | null;
  setGlobalTriggerId: (id: string | null) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "currentAmount">) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number, deductionAccountId: string) => void;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  addAccount: (acc: Omit<Account, "id">) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateBudget: (id: string, spent: number) => void;
  setAllowance: (allowance: Omit<Allowance, "id" | "spent" | "status">) => void;
  updateAllowance: (id: string, al: Partial<Allowance>) => void;
  deleteAllowance: (id: string) => void;
  deductFromAllowance: (id: string, amount: number, description?: string) => void;
  addToAllowance: (id: string, amount: number, description?: string) => void;
  sweepExpiredAllowances: () => void;
  finishAllowanceEarly: (id: string) => void;
  reactivateAllowance: (id: string, newEndDate: string) => void;
  setAdvisorOpen: (open: boolean) => void;
  addGoalContribution: (goalId: string, amount: number, accountId: string) => void;
  profile: { full_name?: string; username?: string; avatar_url?: string } | null;
  setProfile: (profile: any) => void;
  isNewGoalModalOpen: boolean;
  setNewGoalModalOpen: (open: boolean) => void;
}

export const useFinanceStore = create<FinanceState>()((set) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  goals: [],
  allowances: [],
  automations: [],
  savingsGrowth: 0,
  householdId: null,

  setHouseholdId: (id) => set({ householdId: id }),
  setInitialData: (data) => set((state) => ({ ...state, ...data })),

  addAutomation: async (item) => {
    const { householdId } = useFinanceStore.getState();
    if (!householdId) return;
    
    const dbData = {
      name: item.name,
      amount: item.amount,
      frequency: item.frequency,
      recurrence_count: item.recurrenceCount,
      is_fixed_amount: item.isFixedAmount,
      next_date: item.nextDate,
      type: item.type,
      // category column does not exist in automations table
      principal_amount: item.principalAmount ?? null,
      paid_amount: item.paidAmount ?? 0,
      account_id: item.accountId ?? null,
      household_id: householdId
    };

    const { data, error } = await supabase.from('automations').insert(dbData).select().single();
    if (error) console.error("Error adding automation:", error.message, error.details);
    if (!error && data) {
      set((state) => ({
        automations: [...state.automations, {
          id: data.id,
          name: data.name,
          amount: data.amount,
          frequency: data.frequency,
          recurrenceCount: data.recurrence_count,
          isFixedAmount: data.is_fixed_amount,
          nextDate: data.next_date,
          type: data.type,
          category: item.category, // keep in frontend state only
          principalAmount: data.principal_amount,
          paidAmount: data.paid_amount,
          accountId: data.account_id
        }]
      }));
    }
  },
  updateAutomation: async (id, item) => {
    const updateData: any = {};
    if (item.name !== undefined) updateData.name = item.name;
    if (item.amount !== undefined) updateData.amount = item.amount;
    if (item.frequency !== undefined) updateData.frequency = item.frequency;
    if (item.recurrenceCount !== undefined) updateData.recurrence_count = item.recurrenceCount;
    if (item.isFixedAmount !== undefined) updateData.is_fixed_amount = item.isFixedAmount;
    if (item.nextDate !== undefined) updateData.next_date = item.nextDate;
    if (item.type !== undefined) updateData.type = item.type;
    // category not in DB, skip it
    if (item.principalAmount !== undefined) updateData.principal_amount = item.principalAmount;
    if (item.paidAmount !== undefined) updateData.paid_amount = item.paidAmount;
    if (item.accountId !== undefined) updateData.account_id = item.accountId;

    const { error } = await supabase.from('automations').update(updateData).eq('id', id);
    if (error) console.error("Error updating automation:", error.message, error.details);
    if (!error) {
      set((state) => ({
        automations: state.automations.map(a => a.id === id ? { ...a, ...item } : a)
      }));
    }
  },
  deleteAutomation: async (id) => {
    const { error } = await supabase.from('automations').delete().eq('id', id);
    if (error) console.error("Error deleting automation:", error.message);
    if (!error) {
      set((state) => ({
        automations: state.automations.filter(a => a.id !== id)
      }));
    }
  },
  globalTriggerId: null,
  setGlobalTriggerId: (id) => set({ globalTriggerId: id }),
  
  savingsGoals: [],
  addSavingsGoal: async (goal) => {
    const { householdId } = useFinanceStore.getState();
    if (!householdId) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ 
        name: goal.name,
        targetamount: goal.targetAmount,
        currentamount: 0,
        targetaccountid: goal.targetAccountId,
        deductionaccountid: goal.deductionAccountId,
        household_id: householdId 
      })
      .select()
      .single();
    if (error) {
      console.error("Error adding savings goal:", error.message, error.details, error.hint);
      throw new Error(error.message);
    }
    if (data) {
      set((state) => ({ 
        savingsGoals: [...state.savingsGoals, {
          id: data.id,
          name: data.name,
          targetAmount: data.targetamount,
          currentAmount: data.currentamount,
          targetAccountId: data.targetaccountid,
          deductionAccountId: data.deductionaccountid
        }] 
      }));
    }
  },
  updateSavingsGoal: async (id, goal) => {
    const updateData: any = {};
    if (goal.name !== undefined) updateData.name = goal.name;
    if (goal.targetAmount !== undefined) updateData.targetamount = goal.targetAmount;
    if (goal.currentAmount !== undefined) updateData.currentamount = goal.currentAmount;
    if (goal.targetAccountId !== undefined) updateData.targetaccountid = goal.targetAccountId;
    if (goal.deductionAccountId !== undefined) updateData.deductionaccountid = goal.deductionAccountId;

    const { error } = await supabase.from('savings_goals').update(updateData).eq('id', id);
    if (error) console.error("Error updating savings goal:", error.message, error.details);
    if (!error) {
      set((state) => ({
        savingsGoals: state.savingsGoals.map(g => g.id === id ? { ...g, ...goal } : g)
      }));
    }
  },
  deleteSavingsGoal: async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        savingsGoals: state.savingsGoals.filter(g => g.id !== id)
      }));
    }
  },
  contributeToGoal: async (id, amount, deductionAccountId) => {
    const { householdId, accounts, savingsGoals } = useFinanceStore.getState();
    if (!householdId) return;
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return;

    const account = accounts.find(a => a.id === deductionAccountId);
    const targetAccount = accounts.find(a => a.id === goal.targetAccountId);

    // 1. Update Goal Amount
    const { error: gError } = await supabase
      .from('savings_goals')
      .update({ currentamount: (goal.currentAmount || 0) + amount })
      .eq('id', id);

    if (gError) {
      console.error("Error contributing to goal:", gError.message, gError.details);
      return;
    }

    // 2. Create Transaction
    const newTx = {
      date: formatLocalDate(),
      description: `Goal: ${goal.name}`,
      amount,
      type: 'expense',
      category: 'Savings',
      allowance_name: null,
      household_id: householdId
    };

    const { data: txData } = await supabase.from('transactions').insert(newTx).select().single();

    // 3. Update Account Balances
    if (account) {
      await supabase.from('accounts').update({ balance: account.balance - amount }).eq('id', account.id);
    }
    if (targetAccount) {
      await supabase.from('accounts').update({ balance: targetAccount.balance + amount }).eq('id', targetAccount.id);
    }

    set((state) => ({
      savingsGoals: state.savingsGoals.map(g => g.id === id ? { ...g, currentAmount: (g.currentAmount || 0) + amount } : g),
      accounts: state.accounts.map(acc => {
        if (acc.id === deductionAccountId) return { ...acc, balance: acc.balance - amount };
        if (acc.id === goal.targetAccountId) return { ...acc, balance: acc.balance + amount };
        return acc;
      }),
      transactions: txData ? [txData, ...state.transactions] : state.transactions
    }));
  },

  addTransaction: async (tx) => {
    const { householdId, accounts } = useFinanceStore.getState();
    if (!householdId) { console.error("No householdId found for addTransaction"); return; }

    // Resolve account_id from account name
    const accountRecord = accounts.find(a => a.name === tx.account);

    // Only send columns confirmed to exist in the DB schema
    const dbPayload = {
      date: tx.date,
      amount: tx.amount,
      category: tx.category,
      account_id: accountRecord?.id || null,
      type: tx.type,
      description: tx.description,
      allowance_name: tx.allowanceName || null,
      recurring: tx.recurring || false,
      household_id: householdId
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(dbPayload)
      .select()
      .single();

    if (error) console.error("Error adding transaction:", error.message, error.details, error.hint);
    if (!error && data) {
      console.log("[DB Schema] transaction columns:", Object.keys(data));
      set((state) => ({
        transactions: [{ ...data, account: tx.account, allowanceName: data.allowance_name }, ...state.transactions],
        accounts: state.accounts.map(acc =>
          acc.name === tx.account
            ? { ...acc, balance: acc.balance + (tx.type === "income" ? tx.amount : -tx.amount) }
            : acc
        )
      }));
    }
  },


  addAccount: async (acc) => {
    const { householdId } = useFinanceStore.getState();
    if (!householdId) { console.error("No householdId found for addAccount"); return; }

    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...acc, household_id: householdId })
      .select()
      .single();

    if (error) console.error("Error adding account:", error);
    if (!error && data) {
      set((state) => ({
        accounts: [...state.accounts, data]
      }));
    }
  },

  updateAccount: async (id, updatedAcc) => {
    const { error } = await supabase.from('accounts').update(updatedAcc).eq('id', id);
    if (error) console.error("Error updating account:", error);
    if (!error) {
      set((state) => ({
        accounts: state.accounts.map(acc => acc.id === id ? { ...acc, ...updatedAcc } : acc)
      }));
    }
  },

  deleteAccount: async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) console.error("Error deleting account:", error);
    if (!error) {
      set((state) => ({
        accounts: state.accounts.filter(acc => acc.id !== id),
        allowances: state.allowances.filter(al => al.accountId !== id)
      }));
    }
  },

  updateBudget: async (id, spent) => {
    const { budgets } = useFinanceStore.getState();
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;
    const { error } = await supabase.from('budgets').update({ spent: budget.spent + spent }).eq('id', id);
    if (error) console.error("Error updating budget:", error);
    if (!error) {
      set((state) => ({
        budgets: state.budgets.map(b => b.id === id ? { ...b, spent: b.spent + spent } : b)
      }));
    }
  },

  setAllowance: async (al) => {
    const { householdId } = useFinanceStore.getState();
    if (!householdId) { console.error("No householdId found for setAllowance"); return; }
    
    const dbData = {
      name: al.name,
      amount: al.amount,
      frequency: al.frequency,
      account_id: al.accountId,
      start_date: al.startDate,
      end_date: al.endDate,
      color: al.color,
      spent: 0,
      status: 'active',
      household_id: householdId
    };

    const { data, error } = await supabase
      .from('allowances')
      .insert(dbData)
      .select()
      .single();
      
    if (error) console.error("Error setting allowance:", error.message, error.details, error.hint);
    if (!error && data) {
      set((state) => ({
        allowances: [...state.allowances, {
          id: data.id,
          name: data.name,
          amount: data.amount,
          frequency: data.frequency,
          spent: data.spent,
          accountId: data.account_id,
          startDate: data.start_date,
          endDate: data.end_date,
          status: data.status,
          color: data.color
        }]
      }));
    }
  },

  updateAllowance: async (id, updatedAl) => {
    const updateData: any = {};
    if (updatedAl.name !== undefined) updateData.name = updatedAl.name;
    if (updatedAl.amount !== undefined) updateData.amount = updatedAl.amount;
    if (updatedAl.frequency !== undefined) updateData.frequency = updatedAl.frequency;
    if (updatedAl.accountId !== undefined) updateData.account_id = updatedAl.accountId;
    if (updatedAl.startDate !== undefined) updateData.start_date = updatedAl.startDate;
    if (updatedAl.endDate !== undefined) updateData.end_date = updatedAl.endDate;
    if (updatedAl.status !== undefined) updateData.status = updatedAl.status;
    if (updatedAl.color !== undefined) updateData.color = updatedAl.color;
    if (updatedAl.spent !== undefined) updateData.spent = updatedAl.spent;

    const { error } = await supabase.from('allowances').update(updateData).eq('id', id);
    if (error) console.error("Error updating allowance:", error.message, error.details);
    if (!error) {
      set((state) => ({
        allowances: state.allowances.map(al => al.id === id ? { ...al, ...updatedAl } : al)
      }));
    }
  },

  deleteAllowance: async (id) => {
    const { error } = await supabase.from('allowances').delete().eq('id', id);
    if (error) console.error("Error deleting allowance:", error);
    if (!error) {
      set((state) => ({
        allowances: state.allowances.filter(al => al.id !== id)
      }));
    }
  },

  deductFromAllowance: async (id, amount, description) => {
    const { allowances, householdId, accounts } = useFinanceStore.getState();
    const allowance = allowances.find(al => al.id === id);
    if (!allowance || allowance.status === "expired" || !householdId) return;

    // 1. Update Allowance
    const { error: aError } = await supabase
      .from('allowances')
      .update({ spent: allowance.spent + amount })
      .eq('id', id);
    if (aError) { console.error("Error deducting from allowance:", aError); return; }

    // 2. Create Transaction (only confirmed DB columns)
    const newTx = {
      date: formatLocalDate(),
      amount: amount,
      category: allowance.name.includes("Meal") ? "Food" : "Other",
      account_id: allowance.accountId || null,
      type: "expense",
      description: description || `Allowance: ${allowance.name}`,
      allowance_name: allowance.name,
      recurring: false,
      household_id: householdId
    };

    const { data: txData, error: txError } = await supabase.from('transactions').insert(newTx).select().single();
    if (txError) {
      console.error("Error creating allowance transaction:", txError.message, txError.details, txError.hint);
    } else if (txData) {
      console.log("[DB Schema] transaction columns:", Object.keys(txData));
    }

    // 3. Update Account
    const acc = accounts.find(a => a.id === allowance.accountId);
    if (acc) {
      await supabase.from('accounts').update({ balance: acc.balance - amount }).eq('id', acc.id);
    }

    set((state) => ({
      allowances: state.allowances.map(al => al.id === id ? { ...al, spent: al.spent + amount } : al),
      accounts: state.accounts.map(a => a.id === allowance.accountId ? { ...a, balance: a.balance - amount } : a),
      transactions: txData ? [{ ...txData, allowanceName: txData.allowance_name }, ...state.transactions] : state.transactions
    }));
  },

  addToAllowance: async (id, amount, description) => {
    const { allowances, householdId, accounts } = useFinanceStore.getState();
    const allowance = allowances.find(al => al.id === id);
    if (!allowance || allowance.status === "expired" || !householdId) return;

    // 1. Update Allowance
    const { error: aError } = await supabase
      .from('allowances')
      .update({ amount: (allowance.amount || 0) + amount })
      .eq('id', id);
    if (aError) { console.error("Error adding to allowance:", aError); return; }

    // 2. Create Transaction (only confirmed DB columns)
    const newTx = {
      date: formatLocalDate(),
      amount: amount,
      category: allowance.name.includes("Meal") ? "Food" : "Other",
      account_id: allowance.accountId || null,
      type: "income",
      description: description || `Top-up: ${allowance.name}`,
      allowance_name: allowance.name,
      recurring: false,
      household_id: householdId
    };

    const { data: txData, error: txError } = await supabase.from('transactions').insert(newTx).select().single();
    if (txError) console.error("Error creating top-up transaction:", txError.message, txError.details, txError.hint);

    // 3. Update Account
    const acc = accounts.find(a => a.id === allowance.accountId);
    if (acc) {
      await supabase.from('accounts').update({ balance: acc.balance + amount }).eq('id', acc.id);
    }

    set((state) => ({
      allowances: state.allowances.map(al => al.id === id ? { ...al, amount: (al.amount || 0) + amount } : al),
      accounts: state.accounts.map(a => a.id === allowance.accountId ? { ...a, balance: a.balance + amount } : a),
      transactions: txData ? [{ ...txData, allowanceName: txData.allowance_name }, ...state.transactions] : state.transactions
    }));
  },

  sweepExpiredAllowances: async () => {
    const { allowances } = useFinanceStore.getState();
    const now = formatLocalDate();
    const expired = allowances.filter(al => al.status === "active" && al.endDate <= now);
    
    for (const al of expired) {
      const { error } = await supabase.from('allowances').update({ status: 'expired' }).eq('id', al.id);
      if (error) console.error("Error sweeping expired allowance:", error);
    }
    
    set((state) => ({
      allowances: state.allowances.map(al => (al.status === "active" && al.endDate <= now) ? { ...al, status: "expired" } : al)
    }));
  },

  finishAllowanceEarly: async (id) => {
    const { allowances } = useFinanceStore.getState();
    const allowance = allowances.find(al => al.id === id);
    if (!allowance || allowance.status === "expired") return;

    const now = formatLocalDate();
    const { error } = await supabase.from('allowances').update({ status: 'expired', end_date: now }).eq('id', id);
    if (error) console.error("Error finishing allowance early:", error.message, error.details);

    if (!error) {
      set((state) => ({
        allowances: state.allowances.map(al => al.id === id ? { ...al, status: "expired" as const, endDate: now } : al)
      }));
    }
  },
  reactivateAllowance: async (id, newEndDate) => {
    const { error } = await supabase.from('allowances').update({ status: 'active', end_date: newEndDate }).eq('id', id);
    if (error) console.error("Error reactivating allowance:", error.message, error.details);

    if (!error) {
      set((state) => ({
        allowances: state.allowances.map(al => al.id === id ? { ...al, status: "active" as const, endDate: newEndDate } : al)
      }));
    }
  },
  setAdvisorOpen: (open) => set({ isAdvisorOpen: open }),
  addGoalContribution: async (goalId, amount, accountId) => {
    const { contributeToGoal } = useFinanceStore.getState();
    await contributeToGoal(goalId, amount, accountId);
  },
  profile: null,
  setProfile: (profile) => set({ profile }),
  isNewGoalModalOpen: false,
  setNewGoalModalOpen: (open) => set({ isNewGoalModalOpen: open }),
}));
