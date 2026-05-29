-- Habilitar extensión para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Crear tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2) Asegurar columnas necesarias en wallets
ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS is_liability BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS target_amount NUMERIC(12,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS share_divisor INTEGER DEFAULT 1 NOT NULL;

-- 3) Crear tabla cycles
CREATE TABLE IF NOT EXISTS public.cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4) Asegurar columnas en transactions (category_id y cycle_id)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES public.cycles(id) ON DELETE CASCADE;

-- 5) Activar RLS y policies para wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus cuentas" ON public.wallets;
DROP POLICY IF EXISTS "Usuarios insertan sus cuentas" ON public.wallets;
DROP POLICY IF EXISTS "Usuarios actualizan sus cuentas" ON public.wallets;
DROP POLICY IF EXISTS "Usuarios eliminan sus cuentas" ON public.wallets;

CREATE POLICY "Usuarios ven sus cuentas" ON public.wallets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus cuentas" ON public.wallets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus cuentas" ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus cuentas" ON public.wallets
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6) Activar RLS y policies para cycles
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Propietario ve sus ciclos" ON public.cycles;
DROP POLICY IF EXISTS "Usuarios operan sus ciclos" ON public.cycles;

CREATE POLICY "Usuarios operan sus ciclos" ON public.cycles
  FOR ALL
  USING (
    wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
  )
  WITH CHECK (
    wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
  );

-- 7) Activar RLS y policies para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios operan sus transacciones" ON public.transactions;

CREATE POLICY "Usuarios operan sus transacciones" ON public.transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (wallet_id IS NULL OR wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()))
  );

-- 8) Actualizar categorías para soportar presupuestos y activar su seguridad (RLS)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS monthly_limit NUMERIC(12, 2) DEFAULT 0.00;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios operan sus categorias" ON public.categories;

CREATE POLICY "Usuarios operan sus categorias" ON public.categories
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9) Crear tabla de suscripciones y añadir las columnas nuevas con seguridad (RLS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  billing_period TEXT DEFAULT 'monthly',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios operan sus suscripciones" ON public.subscriptions;

CREATE POLICY "Usuarios operan sus suscripciones" ON public.subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10) Monedas favoritas por usuario para el conversor en vivo
CREATE TABLE IF NOT EXISTS public.currency_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, currency_code)
);

ALTER TABLE public.currency_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their currency favorites" ON public.currency_favorites;
DROP POLICY IF EXISTS "Users can insert their currency favorites" ON public.currency_favorites;
DROP POLICY IF EXISTS "Users can delete their currency favorites" ON public.currency_favorites;

CREATE POLICY "Users can view their currency favorites"
  ON public.currency_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their currency favorites"
  ON public.currency_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their currency favorites"
  ON public.currency_favorites
  FOR DELETE
  USING (auth.uid() = user_id);