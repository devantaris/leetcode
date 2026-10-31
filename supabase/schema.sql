-- ==============================================================================
-- GrindOS Product Backend Schema (Supabase)
-- The Operating System for Interview Prep
-- Run this in your Supabase SQL editor: Dashboard → SQL Editor → New Query
-- ==============================================================================

-- 1. GLOBAL LEADERBOARD ENTRIES
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT UNIQUE NOT NULL,        -- stable identifier stored in client / auth
  display_name   TEXT NOT NULL,              -- userProfile.name (shown on board)
  tagline        TEXT DEFAULT '',            -- userProfile.tagline (shown as subtitle)
  is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE, -- if true, show as "Anonymous" on board
  solved_count   INTEGER NOT NULL DEFAULT 0,
  streak         INTEGER NOT NULL DEFAULT 0,
  days_remaining INTEGER NOT NULL DEFAULT 0,
  readiness_pct  INTEGER NOT NULL DEFAULT 0, -- oddsPercentage (0-100)
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER PROFILES & SETTINGS
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  tagline         TEXT DEFAULT '',
  start_date      DATE DEFAULT CURRENT_DATE,
  target_date     DATE,
  rest_day        TEXT DEFAULT 'sunday',
  secondary_skill TEXT DEFAULT 'project',
  is_pro          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. USER PROGRESS CLOUD BACKUP
CREATE TABLE IF NOT EXISTS user_progress (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            TEXT NOT NULL,
  problem_id         TEXT NOT NULL,
  solved_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INTEGER,
  approach_notes     TEXT,
  is_flagged         BOOLEAN DEFAULT FALSE,
  UNIQUE (user_id, problem_id)
);

-- 4. PRIVATE COHORTS & STUDY GROUPS
CREATE TABLE IF NOT EXISTS cohorts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL, -- 6-character group invite code
  name         TEXT NOT NULL,        -- e.g. "IIT Delhi 2026 Batch", "Hostel 4 Grinders"
  created_by   TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cohort_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id  UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'member'
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, user_id)
);

-- 5. PLACEMENT & INTERVIEW TRACKER
CREATE TABLE IF NOT EXISTS placement_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT NOT NULL,
  company        TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'Software Engineer',
  stage          TEXT NOT NULL DEFAULT 'Applied', -- 'Applied' | 'OA Pending' | 'Technical Round 1' | 'Offer Received 🎉' | etc.
  applied_date   DATE DEFAULT CURRENT_DATE,
  compensation   TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. MOCK INTERVIEWS
CREATE TABLE IF NOT EXISTS mock_interviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  problems         JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 45,
  solved_count     INTEGER DEFAULT 0,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ==============================================================================

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies
CREATE POLICY "public_read_leaderboard" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "public_insert_leaderboard" ON leaderboard_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_leaderboard" ON leaderboard_entries FOR UPDATE USING (true);
CREATE POLICY "public_delete_leaderboard" ON leaderboard_entries FOR DELETE USING (true);

-- User profiles policies
CREATE POLICY "public_all_profiles" ON user_profiles FOR ALL USING (true);

-- User progress policies
CREATE POLICY "public_all_progress" ON user_progress FOR ALL USING (true);

-- Cohorts policies
CREATE POLICY "public_all_cohorts" ON cohorts FOR ALL USING (true);
CREATE POLICY "public_all_cohort_members" ON cohort_members FOR ALL USING (true);

-- Placement records policies
CREATE POLICY "public_all_placements" ON placement_records FOR ALL USING (true);

-- ==============================================================================
-- INDEXES & ACTIVE VIEWS
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_leaderboard_solved_streak
  ON leaderboard_entries (solved_count DESC, streak DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_lookup
  ON user_progress (user_id, problem_id);

CREATE INDEX IF NOT EXISTS idx_cohort_code
  ON cohorts (code);

CREATE OR REPLACE VIEW active_leaderboard AS
  SELECT * FROM leaderboard_entries
  WHERE last_synced_at > now() - INTERVAL '30 days'
  ORDER BY solved_count DESC, streak DESC;
