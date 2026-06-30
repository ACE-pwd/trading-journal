-- ============================================
-- AI Trading Journal - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('Buy', 'Sell')),
  entry_price NUMERIC NOT NULL,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  lot_size NUMERIC,
  result TEXT NOT NULL CHECK (result IN ('Win', 'Loss', 'Breakeven')),
  session TEXT CHECK (session IN ('London', 'NY', 'Asia')),
  strategy TEXT,
  emotion TEXT CHECK (emotion IN ('Calm', 'Fear', 'FOMO', 'Revenge')),
  pnl NUMERIC DEFAULT 0,
  screenshot_url TEXT,
  notes TEXT,
  trade_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AI Feedback table
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
  strengths TEXT,
  mistakes TEXT,
  suggestions TEXT,
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can view own AI feedback" ON public.ai_feedback;
DROP POLICY IF EXISTS "Users can insert own AI feedback" ON public.ai_feedback;
DROP POLICY IF EXISTS "Allow authenticated uploads to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of screenshots" ON storage.objects;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trades: users can CRUD their own trades
CREATE POLICY "Users can view own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON public.trades FOR DELETE
  USING (auth.uid() = user_id);

-- AI Feedback: users can access feedback for their own trades
CREATE POLICY "Users can view own AI feedback"
  ON public.ai_feedback FOR SELECT
  USING (trade_id IN (SELECT id FROM public.trades WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own AI feedback"
  ON public.ai_feedback FOR INSERT
  WITH CHECK (trade_id IN (SELECT id FROM public.trades WHERE user_id = auth.uid()));

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Storage bucket for trade screenshots
-- ============================================
-- Create bucket name: trade-screenshots (make sure to set to Public = true)
-- Then execute the storage policies below in SQL editor:

-- 1. Ensure the bucket is public so we can read public URLs easily
UPDATE storage.buckets 
SET public = true 
WHERE id = 'trade-screenshots';

-- 2. Allow authenticated users to upload screenshots to their own folder inside the bucket
CREATE POLICY "Allow authenticated uploads to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'trade-screenshots' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Allow public read of screenshots in this bucket
CREATE POLICY "Allow public read of screenshots"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'trade-screenshots');
