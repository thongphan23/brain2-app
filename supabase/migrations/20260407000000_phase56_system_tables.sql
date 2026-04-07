-- ============================================================
-- Phase 5+6 System Tables Migration
-- Brain2 Platform — sauuvyffudkglybksnynbo
-- Created: 2026-04-07
-- ============================================================

-- 1. Create system schema
CREATE SCHEMA IF NOT EXISTS system;

-- 2. payments table
CREATE TABLE IF NOT EXISTS system.payments (
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

-- 3. knowledge_analytics table
CREATE TABLE IF NOT EXISTS system.knowledge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_notes INTEGER DEFAULT 0,
  total_connections INTEGER DEFAULT 0,
  domain_scores JSONB DEFAULT '[]',
  maturity_distribution JSONB DEFAULT '{"seed":0,"growing":0,"permanent":0}',
  note_type_distribution JSONB DEFAULT '{"concept":0,"insight":0,"story":0,"question":0,"action":0}',
  overall_score FLOAT DEFAULT 0,
  suggested_domains TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

-- 4. recommendations table
CREATE TABLE IF NOT EXISTS system.recommendations (
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

-- 5. usage_daily table
CREATE TABLE IF NOT EXISTS system.usage_daily (
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
-- RLS Policies
-- ============================================================

-- payments: user only sees/manages own payments
ALTER TABLE system.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select_own" ON system.payments;
CREATE POLICY "payments_select_own" ON system.payments
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_insert_own" ON system.payments;
CREATE POLICY "payments_insert_own" ON system.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_update_own" ON system.payments;
CREATE POLICY "payments_update_own" ON system.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- knowledge_analytics: user only sees own
ALTER TABLE system.knowledge_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_select_own" ON system.knowledge_analytics;
CREATE POLICY "analytics_select_own" ON system.knowledge_analytics
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "analytics_insert_own" ON system.knowledge_analytics;
CREATE POLICY "analytics_insert_own" ON system.knowledge_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "analytics_update_own" ON system.knowledge_analytics;
CREATE POLICY "analytics_update_own" ON system.knowledge_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- recommendations: user only sees/manages own
ALTER TABLE system.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recommendations_select_own" ON system.recommendations;
CREATE POLICY "recommendations_select_own" ON system.recommendations
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "recommendations_insert_own" ON system.recommendations;
CREATE POLICY "recommendations_insert_own" ON system.recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "recommendations_update_own" ON system.recommendations;
CREATE POLICY "recommendations_update_own" ON system.recommendations
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "recommendations_delete_own" ON system.recommendations;
CREATE POLICY "recommendations_delete_own" ON system.recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- usage_daily: user only sees own
ALTER TABLE system.usage_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_select_own" ON system.usage_daily;
CREATE POLICY "usage_select_own" ON system.usage_daily
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_insert_own" ON system.usage_daily;
CREATE POLICY "usage_insert_own" ON system.usage_daily
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "usage_update_own" ON system.usage_daily;
CREATE POLICY "usage_update_own" ON system.usage_daily
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON system.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON system.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_code ON system.payments(transaction_code);
CREATE INDEX IF NOT EXISTS idx_knowledge_analytics_user_date ON system.knowledge_analytics(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_priority ON system.recommendations(user_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_usage_daily_user_date ON system.usage_daily(user_id, date DESC);
