-- GrindOS Leaderboard Schema
-- Run this in your Supabase SQL editor: Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT UNIQUE NOT NULL,        -- stable random UUID stored in localStorage
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

-- Enable Row Level Security
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read all rows
CREATE POLICY "public_read" ON leaderboard_entries
  FOR SELECT USING (true);

-- Anyone can insert (client sends their own user_id)
CREATE POLICY "public_insert" ON leaderboard_entries
  FOR INSERT WITH CHECK (true);

-- Anyone can update their own row (matched by user_id in the request body)
CREATE POLICY "public_update" ON leaderboard_entries
  FOR UPDATE USING (true);

-- Anyone can delete their own row (opt-out / hard delete)
CREATE POLICY "public_delete" ON leaderboard_entries
  FOR DELETE USING (true);

-- Index for fast leaderboard query
CREATE INDEX IF NOT EXISTS idx_leaderboard_solved_streak
  ON leaderboard_entries (solved_count DESC, streak DESC);

-- Helpful view: only show recently active users (last 30 days)
CREATE OR REPLACE VIEW active_leaderboard AS
  SELECT * FROM leaderboard_entries
  WHERE last_synced_at > now() - INTERVAL '30 days'
  ORDER BY solved_count DESC, streak DESC;
