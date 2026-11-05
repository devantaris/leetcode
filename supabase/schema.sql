-- ==============================================================================
-- GrindOS Production Supabase Backend Schema
-- Compatible with: user_profiles, user_progress, placement_records, leaderboard_entries
-- ==============================================================================

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  tagline         TEXT DEFAULT 'Software Engineer',
  target_company  TEXT DEFAULT 'Top Tech Roles',
  start_date      DATE DEFAULT CURRENT_DATE,
  target_date     DATE DEFAULT (CURRENT_DATE + INTERVAL '140 days'),
  rest_day        TEXT DEFAULT 'sunday',
  secondary_skill TEXT DEFAULT 'project',
  daily_target    INTEGER DEFAULT 3,
  is_pro          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER PROGRESS (Atomic Problem Solves)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            TEXT NOT NULL,
  problem_id         TEXT NOT NULL,
  difficulty         TEXT DEFAULT 'Medium',
  solved_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INTEGER DEFAULT 0,
  approach_notes     TEXT DEFAULT '',
  is_flagged         BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, problem_id)
);

-- 3. PLACEMENT & INTERVIEW RECORDS
CREATE TABLE IF NOT EXISTS public.placement_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL,
  company        TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'Software Engineer',
  stage          TEXT NOT NULL DEFAULT 'Applied',
  applied_date   DATE DEFAULT CURRENT_DATE,
  compensation   TEXT DEFAULT '',
  notes          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. LEADERBOARD ENTRIES
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT UNIQUE NOT NULL,
  display_name   TEXT NOT NULL,
  tagline        TEXT DEFAULT '',
  avatar_url     TEXT DEFAULT '',
  is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
  solved_count   INTEGER NOT NULL DEFAULT 0,
  streak         INTEGER NOT NULL DEFAULT 0,
  days_remaining INTEGER NOT NULL DEFAULT 0,
  readiness_pct  INTEGER NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. FOCUS SESSIONS (Pomodoro Deep Work)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Drop old policies to prevent duplicates
DROP POLICY IF EXISTS "public_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_own_profiles" ON public.user_profiles;
CREATE POLICY "users_own_profiles"
  ON public.user_profiles FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "public_all_progress" ON public.user_progress;
DROP POLICY IF EXISTS "users_own_progress" ON public.user_progress;
CREATE POLICY "users_own_progress"
  ON public.user_progress FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "public_all_placements" ON public.placement_records;
DROP POLICY IF EXISTS "users_own_placements" ON public.placement_records;
CREATE POLICY "users_own_placements"
  ON public.placement_records FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "public_all_focus_sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "users_own_focus_sessions" ON public.focus_sessions;
CREATE POLICY "users_own_focus_sessions"
  ON public.focus_sessions FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "public_read_leaderboard" ON public.leaderboard_entries;
CREATE POLICY "public_read_leaderboard"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "users_own_leaderboard" ON public.leaderboard_entries;
CREATE POLICY "users_own_leaderboard"
  ON public.leaderboard_entries FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ==============================================================================
-- AUTOMATED TRIGGERS
-- ==============================================================================

-- 1. Auto-provision profile and leaderboard entry when a new user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_avatar TEXT;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1),
    'Operator'
  );
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    ''
  );

  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id::text, v_name)
  ON CONFLICT (user_id) DO UPDATE
  SET display_name = EXCLUDED.display_name;

  INSERT INTO public.leaderboard_entries (user_id, display_name, avatar_url)
  VALUES (NEW.id::text, v_name, v_avatar)
  ON CONFLICT (user_id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE leaderboard_entries.avatar_url END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto-sync solve counts to leaderboard on insert or delete
CREATE OR REPLACE FUNCTION public.sync_progress_to_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id TEXT;
  v_count INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_user_id := OLD.user_id;
  ELSE
    v_user_id := NEW.user_id;
  END IF;

  SELECT count(*) INTO v_count FROM public.user_progress WHERE user_id = v_user_id;

  UPDATE public.leaderboard_entries
  SET solved_count = v_count,
      readiness_pct = LEAST(100, ROUND((v_count::numeric / 332.0) * 100)),
      last_synced_at = now()
  WHERE user_id = v_user_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_progress_changed ON public.user_progress;
CREATE TRIGGER on_progress_changed
  AFTER INSERT OR DELETE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.sync_progress_to_leaderboard();

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_problem ON public.user_progress(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_placements_user ON public.placement_records(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard_entries(solved_count DESC, streak DESC);
