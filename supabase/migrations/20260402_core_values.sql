-- Store the user's selected Core 6 values (cross-area synthesis)
CREATE TABLE IF NOT EXISTS public.core_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  values text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT core_values_user_unique UNIQUE (user_id)
);

ALTER TABLE public.core_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own core values"
  ON public.core_values FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own core values"
  ON public.core_values FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own core values"
  ON public.core_values FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
