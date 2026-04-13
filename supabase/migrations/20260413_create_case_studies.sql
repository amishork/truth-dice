-- Case Studies table for Words Incarnate
-- Stores published case studies, manageable from admin console

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  client_name text not null,
  segment text not null check (segment in ('school', 'family', 'organization')),
  challenge text not null,
  approach text not null,
  outcomes text not null,
  client_quote text,
  client_quote_attribution text,
  engagement_duration text,
  hold_phases_applied text[], -- e.g. ARRAY['honor','observe','live','declare']
  metrics jsonb, -- flexible key-value metrics, e.g. {"faculty_adoption": "90%", "referral_decrease": "35%"}
  published boolean default false,
  featured boolean default false,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.case_studies enable row level security;

-- Public can read published case studies
create policy "Public can read published case studies"
  on public.case_studies for select
  using (published = true);

-- Index for slug lookups
create index idx_case_studies_slug on public.case_studies (slug);

-- Index for segment filtering
create index idx_case_studies_segment on public.case_studies (segment) where published = true;

-- Updated_at trigger
create or replace function update_case_studies_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger case_studies_updated_at
  before update on public.case_studies
  for each row
  execute function update_case_studies_updated_at();
