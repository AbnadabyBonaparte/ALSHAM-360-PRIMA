-- ALSHAM 360° PRIMA — Core schema (initial migration)
-- Derived from src/lib/supabase/types.ts (the code's schema SSOT).
-- Covers the tables actively queried by the implemented pages
-- (Dashboard, Leads, Pipeline, Customer 360, Campaigns, Gamification, etc.).
--
-- Multi-tenant: every business table carries org_id and is protected by RLS,
-- following the CLAUDE.md rule "org_id em toda query". Membership is resolved
-- through public.user_organizations.
--
-- Remaining tables (automations, nft_gallery, gamification_rewards,
-- gamification_rank_history, audit_log, security_audit_log) are intentionally
-- left for a follow-up migration — see docs/SCOPE.md.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Helper: is the current user a member of the given org?
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_organizations uo
    where uo.org_id = target_org
      and uo.user_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Organizations
-- ─────────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  domain     text,
  logo_url   text,
  settings   jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- User <-> Organization membership
-- ─────────────────────────────────────────────────────────────
create table if not exists public.user_organizations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  role        text not null default 'member',
  permissions jsonb,
  joined_at   timestamptz not null default now(),
  unique (user_id, org_id)
);
create index if not exists idx_user_organizations_user on public.user_organizations(user_id);
create index if not exists idx_user_organizations_org  on public.user_organizations(org_id);

-- ─────────────────────────────────────────────────────────────
-- User profiles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'member',
  permissions jsonb,
  settings    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, org_id)
);
create index if not exists idx_user_profiles_org on public.user_profiles(org_id);

-- ─────────────────────────────────────────────────────────────
-- User roles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role_name   text not null,
  permissions jsonb not null default '{}'::jsonb,
  assigned_at timestamptz not null default now(),
  assigned_by uuid not null,
  expires_at  timestamptz
);
create index if not exists idx_user_roles_org  on public.user_roles(org_id);
create index if not exists idx_user_roles_user on public.user_roles(user_id);

-- ─────────────────────────────────────────────────────────────
-- Accounts (empresas)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.accounts (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  name         text not null,
  domain       text,
  industry     text,
  size         text,
  revenue      numeric,
  location     text,
  website      text,
  linkedin_url text,
  description  text,
  status       text not null default 'active',
  owner_id     uuid not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_accounts_org on public.accounts(org_id);

-- ─────────────────────────────────────────────────────────────
-- Campaigns
-- ─────────────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  name       text not null,
  type       text not null,
  status     text not null default 'draft',
  budget     numeric not null default 0,
  spent      numeric not null default 0,
  start_date timestamptz not null default now(),
  end_date   timestamptz,
  owner_id   uuid not null,
  metadata   jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_campaigns_org on public.campaigns(org_id);

-- ─────────────────────────────────────────────────────────────
-- Leads (CRM core)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.leads_crm (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  name           text not null,
  email          text,
  phone          text,
  company        text,
  position       text,
  status         text not null default 'new',
  stage          text not null default 'lead',
  temperature    text not null default 'cold',
  score          integer not null default 0,
  score_ia       integer,
  source         text,
  campaign_id    uuid references public.campaigns(id) on delete set null,
  owner_id       uuid,
  tags           text[],
  metadata       jsonb,
  notes          text,
  consent        boolean not null default false,
  consent_at     timestamptz,
  origem_captura text,
  canal_captura  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_leads_crm_org      on public.leads_crm(org_id);
create index if not exists idx_leads_crm_campaign on public.leads_crm(campaign_id);
create index if not exists idx_leads_crm_owner    on public.leads_crm(owner_id);

-- ─────────────────────────────────────────────────────────────
-- Contacts
-- ─────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  lead_id             uuid references public.leads_crm(id) on delete set null,
  account_id          uuid references public.accounts(id) on delete set null,
  name                text not null,
  email               text,
  phone               text,
  position            text,
  linkedin_url        text,
  twitter_handle      text,
  is_decision_maker   boolean not null default false,
  influence_level     text not null default 'unknown',
  relationship_status text not null default 'new',
  last_contact        timestamptz,
  next_followup       timestamptz,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_contacts_org on public.contacts(org_id);

-- ─────────────────────────────────────────────────────────────
-- Opportunities
-- ─────────────────────────────────────────────────────────────
create table if not exists public.opportunities (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  lead_id             uuid not null references public.leads_crm(id) on delete cascade,
  title               text not null,
  value               numeric not null default 0,
  currency            text not null default 'BRL',
  stage               text not null default 'qualification',
  probability         numeric not null default 0,
  expected_close_date timestamptz,
  owner_id            uuid not null,
  campaign_id         uuid references public.campaigns(id) on delete set null,
  deal_size           text,
  competitors         text[],
  decision_makers     jsonb,
  pain_points         text[],
  timeline            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_opportunities_org  on public.opportunities(org_id);
create index if not exists idx_opportunities_lead on public.opportunities(lead_id);

-- ─────────────────────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  message    text not null,
  data       jsonb,
  read       boolean not null default false,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_org  on public.notifications(org_id);

-- ─────────────────────────────────────────────────────────────
-- AI predictions
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ai_predictions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  lead_id         uuid not null references public.leads_crm(id) on delete cascade,
  prediction_type text not null,
  confidence      numeric not null,
  prediction_data jsonb not null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_ai_predictions_org on public.ai_predictions(org_id);

-- ─────────────────────────────────────────────────────────────
-- Gamification
-- ─────────────────────────────────────────────────────────────
create table if not exists public.gamification_points (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  points     integer not null,
  reason     text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_gamification_points_org  on public.gamification_points(org_id);
create index if not exists idx_gamification_points_user on public.gamification_points(user_id);

create table if not exists public.gamification_badges (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  description     text not null,
  icon            text not null,
  criteria        jsonb not null,
  points_required integer not null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_gamification_badges_org on public.gamification_badges(org_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (multi-tenant isolation)
-- ─────────────────────────────────────────────────────────────
alter table public.organizations       enable row level security;
alter table public.user_organizations  enable row level security;
alter table public.user_profiles        enable row level security;
alter table public.user_roles           enable row level security;
alter table public.accounts             enable row level security;
alter table public.campaigns            enable row level security;
alter table public.leads_crm            enable row level security;
alter table public.contacts             enable row level security;
alter table public.opportunities        enable row level security;
alter table public.notifications        enable row level security;
alter table public.ai_predictions       enable row level security;
alter table public.gamification_points  enable row level security;
alter table public.gamification_badges  enable row level security;

-- Organizations: a user sees an org only if they are a member.
drop policy if exists org_member_select on public.organizations;
create policy org_member_select on public.organizations
  for select using (public.is_org_member(id));

-- user_organizations: a user sees their own membership rows.
drop policy if exists user_org_self on public.user_organizations;
create policy user_org_self on public.user_organizations
  for select using (user_id = auth.uid());

-- Generic per-tenant policies: full access to rows of orgs the user belongs to.
do $$
declare t text;
begin
  foreach t in array array[
    'user_profiles','user_roles','accounts','campaigns','leads_crm','contacts',
    'opportunities','notifications','ai_predictions','gamification_points','gamification_badges'
  ]
  loop
    execute format('drop policy if exists tenant_all on public.%I;', t);
    execute format(
      'create policy tenant_all on public.%I for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));',
      t
    );
  end loop;
end $$;
