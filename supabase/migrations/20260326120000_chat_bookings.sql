CREATE TABLE public.chat_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text,
  contact_method text,
  contact_info text,
  customer_type text,
  intention text,
  support_type text,
  offering text,
  timing text,
  desired_outcome text,
  value_explored text,
  context_explored text,
  insight text,
  core_values text[],
  raw_summary jsonb
);

ALTER TABLE public.chat_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat bookings"
  ON public.chat_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
