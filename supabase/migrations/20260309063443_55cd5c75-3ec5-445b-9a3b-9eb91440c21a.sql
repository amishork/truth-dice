
CREATE TABLE public.email_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  source text NOT NULL DEFAULT 'newsletter',
  name text
);

ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit email capture"
ON public.email_captures
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
