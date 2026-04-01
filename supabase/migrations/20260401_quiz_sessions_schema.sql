-- Create quiz_sessions table
-- NOTE: This table was originally created via Supabase dashboard.
-- This migration documents the schema for version control reproducibility.
-- Run with IF NOT EXISTS to be safe against existing deployments.

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  area_of_life text NOT NULL DEFAULT 'personal',
  final_six_values text[] NOT NULL DEFAULT '{}',
  all_winners text[] NOT NULL DEFAULT '{}',
  selection_counts jsonb NOT NULL DEFAULT '{}',
  duration_seconds integer
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (supports both authenticated users and anonymous guests)
CREATE POLICY "Anyone can insert quiz sessions"
  ON public.quiz_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can read their own sessions
CREATE POLICY "Users can read own quiz sessions"
  ON public.quiz_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Anonymous users cannot read sessions (they use localStorage)
-- No SELECT policy for anon role

-- Authenticated users can claim unclaimed (guest) sessions by setting user_id
CREATE POLICY "Users can claim guest sessions"
  ON public.quiz_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Index for fast user session lookups
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON public.quiz_sessions(user_id)
  WHERE user_id IS NOT NULL;
