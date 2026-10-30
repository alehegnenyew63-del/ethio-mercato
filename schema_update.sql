-- Ethio-Mercato Database Update
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/bwebignuouajdohlqmbw/sql)

-- 1. Add can_withdraw flag to users table (default false)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS can_withdraw BOOLEAN DEFAULT FALSE;

-- 2. Automatically sync can_withdraw = true for all users who already have an approved deposit
UPDATE public.users u
SET can_withdraw = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.deposits d 
  WHERE d.user_id = u.id AND d.status = 'approved'
);

-- 3. Trigger function to automatically maintain can_withdraw when a deposit is approved
CREATE OR REPLACE FUNCTION public.handle_deposit_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.users 
    SET can_withdraw = TRUE,
        updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_deposit_approved_unlock ON public.deposits;

CREATE TRIGGER tr_deposit_approved_unlock
AFTER UPDATE OF status ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION public.handle_deposit_approval();

-- 4. Create payment_accounts table for dynamic payment methods management
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_holder_name VARCHAR(150) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and allow read/write for anon
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read payment_accounts" ON public.payment_accounts;
CREATE POLICY "Public read payment_accounts" ON public.payment_accounts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert payment_accounts" ON public.payment_accounts;
CREATE POLICY "Public insert payment_accounts" ON public.payment_accounts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update payment_accounts" ON public.payment_accounts;
CREATE POLICY "Public update payment_accounts" ON public.payment_accounts
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete payment_accounts" ON public.payment_accounts;
CREATE POLICY "Public delete payment_accounts" ON public.payment_accounts
  FOR DELETE USING (true);

-- Enable Realtime on payment_accounts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_accounts;

-- Seed default payment accounts
INSERT INTO public.payment_accounts (provider_name, account_number, account_holder_name, is_active)
SELECT 'Telebirr', '0943257056', 'Shibabew', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE provider_name ILIKE '%telebirr%');

INSERT INTO public.payment_accounts (provider_name, account_number, account_holder_name, is_active)
SELECT 'Commercial Bank of Ethiopia (CBE)', '1000331894994', 'Alehegn', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE provider_name ILIKE '%cbe%' OR provider_name ILIKE '%commercial bank%');

INSERT INTO public.payment_accounts (provider_name, account_number, account_holder_name, is_active)
SELECT 'Bank of Abyssinia', '157312097', 'Alehegn', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE provider_name ILIKE '%abyssinia%');

