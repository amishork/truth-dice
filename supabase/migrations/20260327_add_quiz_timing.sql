-- Add duration tracking to quiz_sessions
ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

-- RPC to get average completion time
CREATE OR REPLACE FUNCTION public.get_avg_quiz_duration()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT ROUND(AVG(duration_seconds))::integer
     FROM public.quiz_sessions
     WHERE duration_seconds IS NOT NULL
       AND duration_seconds > 60
       AND duration_seconds < 7200),
    720
  );
$$;

-- Allow anon/authenticated to call the RPC
GRANT EXECUTE ON FUNCTION public.get_avg_quiz_duration() TO anon, authenticated;
