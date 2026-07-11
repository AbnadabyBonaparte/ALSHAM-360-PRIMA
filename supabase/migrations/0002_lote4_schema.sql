-- ALSHAM 360° PRIMA — LOTE 4 schema (support, knowledge base, goals)
-- Adds the three minimal, real, multi-tenant tables needed by the LOTE 4 pages
-- that had no existing home in the core schema. Every table carries org_id and is
-- protected by RLS through public.is_org_member (defined in 0001_core_schema.sql),
-- following the CLAUDE.md rule "org_id em toda query".
--
-- New tables:
--   support_tickets  -> Tickets (Suporte): tickets-lista, tickets-detalhes
--   kb_articles      -> Base de Conhecimento: base-de-conhecimento
--   goals            -> Metas: metas-e-desafios (individual/challenge) e metas-de-equipe (team)

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Support tickets
-- ─────────────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  subject         text not null,
  description     text,
  status          text not null default 'open',        -- open | pending | resolved | closed
  priority        text not null default 'medium',       -- low | medium | high | urgent
  category        text,
  channel         text,                                  -- email | chat | phone | portal
  requester_name  text,
  requester_email text,
  contact_id      uuid references public.contacts(id) on delete set null,
  assignee_id     uuid,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_support_tickets_org      on public.support_tickets(org_id);
create index if not exists idx_support_tickets_status   on public.support_tickets(status);
create index if not exists idx_support_tickets_assignee on public.support_tickets(assignee_id);

-- ─────────────────────────────────────────────────────────────
-- Knowledge base articles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.kb_articles (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  title       text not null,
  slug        text,
  category    text,
  content     text,
  status      text not null default 'draft',            -- draft | published | archived
  views       integer not null default 0,
  author_id   uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_kb_articles_org    on public.kb_articles(org_id);
create index if not exists idx_kb_articles_status on public.kb_articles(status);

-- ─────────────────────────────────────────────────────────────
-- Goals (individual challenges + team goals)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null default 'individual',     -- individual | challenge | team
  team          text,
  owner_id      uuid,
  metric        text,                                    -- e.g. "receita", "leads", "deals"
  target_value  numeric not null default 0,
  current_value numeric not null default 0,
  unit          text,                                    -- e.g. "R$", "leads", "%"
  status        text not null default 'active',          -- active | completed | at_risk | paused
  due_date      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_goals_org      on public.goals(org_id);
create index if not exists idx_goals_category on public.goals(category);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (multi-tenant isolation)
-- ─────────────────────────────────────────────────────────────
alter table public.support_tickets enable row level security;
alter table public.kb_articles     enable row level security;
alter table public.goals           enable row level security;

do $$
declare t text;
begin
  foreach t in array array['support_tickets','kb_articles','goals']
  loop
    execute format('drop policy if exists tenant_all on public.%I;', t);
    execute format(
      'create policy tenant_all on public.%I for all using (public.is_org_member(org_id)) with check (public.is_org_member(org_id));',
      t
    );
  end loop;
end $$;
