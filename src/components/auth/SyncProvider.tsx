"use client";

import { useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useFinanceStore } from "@/lib/store";
import { useAuth } from "./AuthProvider";

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setInitialData, setHouseholdId, setProfile, householdId } = useFinanceStore();

  // 1. Initial Data Fetch & Household Setup
  useEffect(() => {
    if (!user) return;

    const initializeData = async () => {
      // Get Profile and Household
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, households(*)')
        .eq('id', user.id)
        .maybeSingle();

      // If no profile OR profile has no household, we need to set one up
      if (!profile || !profile.household_id) {
        // 1. Create household if needed
        const { data: newHousehold, error: hError } = await supabase
          .from('households')
          .insert({ name: 'My Family Cloud' })
          .select()
          .single();

        if (hError) {
          console.error("Error creating household:", hError);
          return;
        }

        // 2. Update or Create profile with the new household_id
        if (profile) {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ household_id: newHousehold.id })
            .eq('id', user.id)
            .select()
            .single();
          profile = updatedProfile;
        } else {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              household_id: newHousehold.id
            })
            .select()
            .single();
          profile = newProfile;
        }
      }

      if (profile) {
        setProfile(profile);
      }

      if (profile?.household_id) {
        setHouseholdId(profile.household_id);

        // Fetch all data for this household
        const [
          { data: accounts },
          { data: transactions },
          { data: goals },
          { data: allowances },
          { data: automations }
        ] = await Promise.all([
          supabase.from('accounts').select('*').eq('household_id', profile.household_id),
          supabase.from('transactions').select('*').eq('household_id', profile.household_id).order('date', { ascending: false }),
          supabase.from('savings_goals').select('*').eq('household_id', profile.household_id),
          supabase.from('allowances').select('*').eq('household_id', profile.household_id),
          supabase.from('automations').select('*').eq('household_id', profile.household_id)
        ]);

        setInitialData({
          accounts: accounts || [],
          transactions: (transactions || []).map((tx, i) => {
            // One-time diagnostic: log column names of first row
            if (i === 0) console.log('[DB Schema] transactions columns:', Object.keys(tx));
            return { ...tx, allowanceName: tx.allowance_name };
          }),
          savingsGoals: (goals || []).map(g => ({
            id: g.id,
            name: g.name,
            targetAmount: g.targetamount,
            currentAmount: g.currentamount,
            targetAccountId: g.targetaccountid,
            deductionAccountId: g.deductionaccountid
          })),
          allowances: (allowances || []).map(al => ({
            id: al.id,
            name: al.name,
            amount: al.amount,
            frequency: al.frequency,
            spent: al.spent,
            accountId: al.account_id,
            startDate: al.start_date,
            endDate: al.end_date,
            status: al.status,
            color: al.color
          })),
          automations: (automations || []).map(a => ({
            id: a.id,
            name: a.name,
            amount: a.amount,
            frequency: a.frequency,
            recurrenceCount: a.recurrence_count,
            isFixedAmount: a.is_fixed_amount,
            nextDate: a.next_date,
            type: a.type,
            category: a.category,
            principalAmount: a.principal_amount,
            paidAmount: a.paid_amount,
            accountId: a.account_id
          }))
        });
      }
    };

    initializeData();
  }, [user, setInitialData, setHouseholdId]);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel('household_sync')
      .on('postgres_changes', { event: '*', schema: 'public', filter: `household_id=eq.${householdId}` }, (payload) => {
        // Refetch or intelligently update store
        const table = payload.table;
        supabase.from(table).select('*').eq('household_id', householdId).then(({ data }) => {
          if (data) {
            const update: any = {};
            if (table === 'accounts') update.accounts = data;
            if (table === 'transactions') {
              update.transactions = (data as any[]).map(tx => ({
                ...tx,
                account: tx.account_id,  // will resolve name client-side if needed
                allowanceName: tx.allowance_name
              }));
            }
            if (table === 'savings_goals') {
              update.savingsGoals = (data as any[]).map(g => ({
                id: g.id,
                name: g.name,
                targetAmount: g.targetamount,
                currentAmount: g.currentamount,
                targetAccountId: g.targetaccountid,
                deductionAccountId: g.deductionaccountid
              }));
            }
            if (table === 'allowances') {
              update.allowances = (data as any[]).map(al => ({
                id: al.id,
                name: al.name,
                amount: al.amount,
                frequency: al.frequency,
                spent: al.spent,
                accountId: al.account_id,
                startDate: al.start_date,
                endDate: al.end_date,
                status: al.status,
                color: al.color
              }));
            }
            if (table === 'automations') {
              update.automations = (data as any[]).map(a => ({
                id: a.id,
                name: a.name,
                amount: a.amount,
                frequency: a.frequency,
                recurrenceCount: a.recurrence_count,
                isFixedAmount: a.is_fixed_amount,
                nextDate: a.next_date,
                type: a.type,
                category: a.category,
                principalAmount: a.principal_amount,
                paidAmount: a.paid_amount,
                accountId: a.account_id
              }));
            }
            setInitialData(update);
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, setInitialData]);

  return <>{children}</>;
}
