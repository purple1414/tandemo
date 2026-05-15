-- ============================================================
-- Tandemo Financial OS — Complete Database Schema
-- Run this in: https://supabase.com/dashboard → SQL Editor
-- Project: oegyqivbropxxvxdotfc
-- ============================================================

-- ── 1. HOUSEHOLDS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'My Family Cloud',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  full_name    TEXT,
  username     TEXT,
  avatar_url   TEXT,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. ACCOUNTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'Bank',
  balance      NUMERIC(15,2) NOT NULL DEFAULT 0,
  color        TEXT DEFAULT '#6366f1',
  icon         TEXT DEFAULT 'wallet',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. TRANSACTIONS ─────────────────────────────────────────
-- Check existing columns first, then add missing ones
DO $$
BEGIN
  -- Create if not exists
  CREATE TABLE IF NOT EXISTS transactions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id   UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    date           DATE NOT NULL DEFAULT CURRENT_DATE,
    amount         NUMERIC(15,2) NOT NULL DEFAULT 0,
    type           TEXT NOT NULL DEFAULT 'expense',
    category       TEXT DEFAULT 'Other',
    description    TEXT DEFAULT '',
    allowance_name TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
  );
END $$;

-- ── 5. ALLOWANCES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allowances (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  amount       NUMERIC(15,2) NOT NULL DEFAULT 0,
  spent        NUMERIC(15,2) NOT NULL DEFAULT 0,
  frequency    TEXT NOT NULL DEFAULT 'Month',
  account_id   UUID REFERENCES accounts(id) ON DELETE SET NULL,
  start_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  status       TEXT NOT NULL DEFAULT 'active',
  color        TEXT DEFAULT '#6366f1',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. SAVINGS GOALS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id        UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  target_amount       NUMERIC(15,2) NOT NULL DEFAULT 0,
  current_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
  target_account_id   UUID REFERENCES accounts(id) ON DELETE SET NULL,
  deduction_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. AUTOMATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  amount           NUMERIC(15,2) NOT NULL DEFAULT 0,
  frequency        TEXT NOT NULL DEFAULT 'Monthly',
  recurrence_count INTEGER,
  is_fixed_amount  BOOLEAN NOT NULL DEFAULT TRUE,
  next_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  type             TEXT NOT NULL DEFAULT 'expense',
  category         TEXT DEFAULT 'N/A',
  principal_amount NUMERIC(15,2),
  paid_amount      NUMERIC(15,2) DEFAULT 0,
  account_id       UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE households    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances    ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations   ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "household_members_households"   ON households;
DROP POLICY IF EXISTS "own_profile"                    ON profiles;
DROP POLICY IF EXISTS "household_members_accounts"     ON accounts;
DROP POLICY IF EXISTS "household_members_transactions" ON transactions;
DROP POLICY IF EXISTS "household_members_allowances"   ON allowances;
DROP POLICY IF EXISTS "household_members_savings"      ON savings_goals;
DROP POLICY IF EXISTS "household_members_automations"  ON automations;

-- Households: members can read their own
CREATE POLICY "household_members_households" ON households
  FOR ALL USING (
    id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

-- Profiles: users manage their own profile only
CREATE POLICY "own_profile" ON profiles
  FOR ALL USING (id = auth.uid());

-- Accounts, Transactions, Allowances, Savings, Automations:
-- scoped to authenticated user's household
CREATE POLICY "household_members_accounts" ON accounts
  FOR ALL USING (
    household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "household_members_transactions" ON transactions
  FOR ALL USING (
    household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "household_members_allowances" ON allowances
  FOR ALL USING (
    household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "household_members_savings" ON savings_goals
  FOR ALL USING (
    household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "household_members_automations" ON automations
  FOR ALL USING (
    household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================================
-- REALTIME
-- ============================================================
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE allowances;
ALTER PUBLICATION supabase_realtime ADD TABLE savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE automations;

-- ============================================================
-- DONE ✓
-- ============================================================
