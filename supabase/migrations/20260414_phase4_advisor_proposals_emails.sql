-- Phase 4: Multi-advisor prep, proposals, email sends

-- ─── 4.4: Advisors table ───
create table if not exists public.advisors (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null default 'owner' check (role in ('owner', 'advisor')),
  created_at timestamptz default now()
);

alter table public.advisors enable row level security;

-- Seed Alex as the owner
insert into public.advisors (email, name, role)
values ('alex@wordsincarnate.com', 'Alex Mishork', 'owner')
on conflict (email) do nothing;

-- ─── 4.4: Add advisor_id columns (nullable) ───
alter table public.leads add column if not exists advisor_id uuid references public.advisors(id);
alter table public.engagements add column if not exists advisor_id uuid references public.advisors(id);
alter table public.lead_activities add column if not exists advisor_id uuid references public.advisors(id);
alter table public.engagement_sessions add column if not exists advisor_id uuid references public.advisors(id);

-- ─── 4.1: Proposals table ───
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  client_name text not null,
  organization text,
  segment text not null check (segment in ('family', 'school', 'organization')),
  engagement_type text not null,
  tier text,
  investment_amount numeric,
  investment_description text,
  timeline text,
  deliverables jsonb default '[]'::jsonb,
  custom_notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'accepted', 'declined')),
  sent_at timestamptz,
  viewed_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.proposals enable row level security;

create or replace function update_proposals_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger proposals_updated_at
  before update on public.proposals
  for each row
  execute function update_proposals_updated_at();

-- ─── 4.2: Email sends tracking ───
create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id),
  template_key text not null,
  recipient_email text not null,
  subject text,
  status text not null default 'sent' check (status in ('sent', 'delivered', 'failed', 'bounced')),
  resend_id text,
  sent_at timestamptz default now()
);

alter table public.email_sends enable row level security;

create index idx_email_sends_lead on public.email_sends (lead_id);
create index idx_email_sends_sent on public.email_sends (sent_at desc);
