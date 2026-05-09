-- Supabase Schema for Antigravity Mario

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_id INT DEFAULT 1,
  best_score INT DEFAULT 0,
  total_games INT DEFAULT 0,
  total_coins INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Auto-create profile trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_id)
  VALUES (new.id, new.raw_user_meta_data->>'username', 1);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Scores Table
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INT NOT NULL,
  level_reached INT NOT NULL,
  coins_collected INT NOT NULL,
  gravity_flips INT NOT NULL,
  duration_seconds INT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secure scores table
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scores are viewable by everyone."
  ON public.scores FOR SELECT
  USING ( true );

-- We do NOT allow inserts from the client directly to prevent cheating.
-- Inserts must happen via the Node.js backend using SERVICE_ROLE_KEY.

-- 3. Weekly Leaderboard View
-- Aggregates max(score) per user for the current ISO week.
CREATE OR REPLACE VIEW public.weekly_leaderboard AS
SELECT 
  p.id as user_id,
  p.username,
  p.avatar_id,
  MAX(s.score) as best_weekly_score,
  MAX(s.level_reached) as best_level,
  MAX(s.played_at) as achieved_at
FROM public.scores s
JOIN public.profiles p ON s.user_id = p.id
WHERE date_trunc('week', s.played_at) = date_trunc('week', NOW())
GROUP BY p.id, p.username, p.avatar_id
ORDER BY best_weekly_score DESC;
