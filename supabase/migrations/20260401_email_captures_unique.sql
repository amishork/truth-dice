-- Add unique constraint on email_captures.email
-- Required for the upsert({ onConflict: "email" }) calls in the frontend.
-- NOTE: This constraint may already exist if added via Supabase dashboard.
-- Using DO block to handle idempotently.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_captures_email_key'
  ) THEN
    ALTER TABLE public.email_captures ADD CONSTRAINT email_captures_email_key UNIQUE (email);
  END IF;
END $$;

-- Also allow upsert (requires UPDATE policy alongside INSERT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_captures' AND policyname = 'Anyone can update email capture'
  ) THEN
    CREATE POLICY "Anyone can update email capture"
      ON public.email_captures
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
