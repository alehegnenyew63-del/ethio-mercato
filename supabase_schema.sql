-- ==============================================================================
-- ETHIO-MERCATO VIP PLATFORM - FULL DATABASE RESET & REBUILD
-- ==============================================================================
-- ⚠️  IMPORTANT: This script drops and rebuilds all tables cleanly.
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- STEP 0: DROP EVERYTHING (clean slate to fix "column does not exist" errors)
-- ==============================================================================
DROP TABLE IF EXISTS public.withdrawals  CASCADE;
DROP TABLE IF EXISTS public.deposits     CASCADE;
DROP TABLE IF EXISTS public.purchases    CASCADE;
DROP TABLE IF EXISTS public.products     CASCADE;
DROP TABLE IF EXISTS public.users        CASCADE;

-- Also drop any stale storage policies
DROP POLICY IF EXISTS "Public Read Receipts"   ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Receipts" ON storage.objects;

-- ==============================================================================
-- STEP 1: EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- STEP 2: USERS TABLE
-- ==============================================================================
CREATE TABLE public.users (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20)   UNIQUE NOT NULL,
    password_hash   TEXT          NOT NULL,
    balance         NUMERIC(14,2) NOT NULL DEFAULT 200.00 CHECK (balance >= 0),
    referral_code   VARCHAR(12)   UNIQUE NOT NULL,
    referred_by     VARCHAR(12),
    total_recharged NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_withdrawn NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    is_admin        BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_ref   ON public.users(referral_code);

-- ==============================================================================
-- STEP 3: PRODUCTS TABLE (VIP Investment Packages)
-- ==============================================================================
CREATE TABLE public.products (
    id            SERIAL        PRIMARY KEY,
    title         VARCHAR(120)  NOT NULL,
    price         NUMERIC(12,2) NOT NULL CHECK (price > 0),
    daily_return  NUMERIC(12,2) NOT NULL CHECK (daily_return > 0),
    total_return  NUMERIC(12,2) NOT NULL,
    duration_days INT           NOT NULL DEFAULT 90,
    image_url     TEXT          NOT NULL,
    badge         VARCHAR(50)   NOT NULL DEFAULT 'Hot'
);

-- Seed the 7 VIP Luxury Investment Packages
INSERT INTO public.products (title, price, daily_return, total_return, duration_days, image_url, badge)
VALUES
  ('Rolex Submariner VIP1',  700.00,    42.00,    3780.00,  90, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',  'Popular'),
  ('Rolex Datejust VIP2',   1200.00,    78.00,    7020.00,  90, 'https://images.unsplash.com/photo-1547996160-71dfabbce5d7?w=600&auto=format&fit=crop&q=80',  'Hot 🔥'),
  ('Rolex Oyster VIP3',     2500.00,   175.00,   15750.00,  90, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',  'High Yield'),
  ('Rolex GMT-Master VIP4', 5000.00,   375.00,   33750.00,  90, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',  'Super Return'),
  ('Rolex Daytona VIP5',   10000.00,   800.00,   72000.00,  90, 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&auto=format&fit=crop&q=80',  'VIP High'),
  ('Rolex Sky-Dweller VIP6',20000.00,  1700.00,  153000.00, 90, 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&auto=format&fit=crop&q=80',  'Premium'),
  ('Rolex Day-Date Gold VIP7',40000.00,3600.00,  324000.00, 90, 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=600&auto=format&fit=crop&q=80',  'Ultimate Crown');

-- ==============================================================================
-- STEP 4: PURCHASES TABLE
-- ==============================================================================
CREATE TABLE public.purchases (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id        INT           NOT NULL REFERENCES public.products(id),
    price             NUMERIC(12,2) NOT NULL,
    daily_return      NUMERIC(12,2) NOT NULL,
    days_remaining    INT           NOT NULL DEFAULT 90,
    total_earned      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    last_collected_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    status            VARCHAR(20)   NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'completed')),
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_user ON public.purchases(user_id);

-- ==============================================================================
-- STEP 5: DEPOSITS TABLE
-- ==============================================================================
CREATE TABLE public.deposits (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 50),
    payment_method VARCHAR(50)   NOT NULL,
    screenshot_url TEXT          NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deposits_user   ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);

-- ==============================================================================
-- STEP 6: WITHDRAWALS TABLE
-- ==============================================================================
CREATE TABLE public.withdrawals (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    account_number VARCHAR(100)  NOT NULL,
    payment_method VARCHAR(50)   NOT NULL,
    status         VARCHAR(20)   NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_user ON public.withdrawals(user_id);

-- ==============================================================================
-- STEP 7: ROW LEVEL SECURITY (Full access via anon key)
-- ==============================================================================
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_users"       ON public.users        FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_read_products"   ON public.products     FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "allow_all_purchases"   ON public.purchases    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_deposits"    ON public.deposits     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_withdrawals" ON public.withdrawals  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- STEP 8: STORAGE BUCKET FOR PAYMENT RECEIPT SCREENSHOTS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-receipts', 'deposit-receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Receipts"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'deposit-receipts');

CREATE POLICY "Public Upload Receipts"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'deposit-receipts');

-- ==============================================================================
-- ✅ DONE — All tables created, 7 VIP products seeded, storage bucket ready.
-- ==============================================================================
