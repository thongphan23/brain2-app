-- ============================================================
-- Fix Schema Mismatch: Mirror system tables to public schema
-- Bug: payment-webhook queries from('payments') (→ public schema)
--      but migration created tables in system.payments
-- Fix: Create public.payments so edge functions work without changes
-- Created: 2026-04-08
-- ============================================================

-- payments (public schema — for edge function queries)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier_target TEXT NOT NULL CHECK (tier_target IN ('pro', 'vip')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'VND',
  transaction_code TEXT UNIQUE,
  payment_method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  email_raw TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- recommendations (public schema — for recommend edge function)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('study_topic', 'connect_notes', 'review_note', 'create_note')),
  title TEXT NOT NULL,
  description TEXT,
  related_note_ids UUID[] DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- usage_daily (public schema)
CREATE TABLE IF NOT EXISTS public.usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_used INTEGER DEFAULT 0,
  notes_created INTEGER DEFAULT 0,
  ai_cost_usd FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================
-- RLS for public.payments
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select_own_pub" ON public.payments;
CREATE POLICY "payments_select_own_pub" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_insert_own_pub" ON public.payments;
CREATE POLICY "payments_insert_own_pub" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_update_own_pub" ON public.payments;
CREATE POLICY "payments_update_own_pub" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RLS for public.recommendations
-- ============================================================
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recommendations_select_own_pub" ON public.recommendations;
CREATE POLICY "recommendations_select_own_pub" ON public.recommendations
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "recommendations_insert_own_pub" ON public.recommendations;
CREATE POLICY "recommendations_insert_own_pub" ON public.recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "recommendations_update_own_pub" ON public.recommendations;
CREATE POLICY "recommendations_update_own_pub" ON public.recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RLS for public.usage_daily
-- ============================================================
ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_daily_select_own_pub" ON public.usage_daily;
CREATE POLICY "usage_daily_select_own_pub" ON public.usage_daily
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_daily_insert_own_pub" ON public.usage_daily;
CREATE POLICY "usage_daily_insert_own_pub" ON public.usage_daily
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payments_pub_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_pub_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_pub_transaction_code ON public.payments(transaction_code);
CREATE INDEX IF NOT EXISTS idx_recommendations_pub_user_priority ON public.recommendations(user_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_usage_daily_pub_user_date ON public.usage_daily(user_id, date DESC);
