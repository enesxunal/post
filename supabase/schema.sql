-- =============================================================================
-- SUPABASE KURULUM — Bu dosyanın TAMAMINI bir kez SQL Editor'da çalıştırın.
-- Sıra: 1) Bu dosya (schema.sql)  2) İsteğe bağlı seed.sql
-- Sadece policy parçasını çalıştırmayın; önce tablolar oluşmalı.
-- =============================================================================

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('user', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('draft', 'paid', 'generating', 'ready', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'generation_status') then
    create type generation_status as enum ('draft', 'queued', 'composing_prompt', 'generating_image', 'generating_caption', 'ready', 'failed');
  end if;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role app_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  brand_name text not null,
  brand_description text,
  sector text not null,
  custom_sector text,
  primary_color text not null,
  visual_style text not null,
  logo_url text,
  package_type text not null default 'base',
  base_credits integer not null default 10,
  remaining_credits integer not null default 10,
  bonus_credits_granted boolean not null default false,
  status project_status not null default 'draft',
  generation_stopped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  amount_total integer not null,
  currency text not null default 'TRY',
  status order_status not null default 'pending',
  payment_provider text not null default 'tosla',
  provider_payment_id text,
  addons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists special_days (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  date_type text not null,
  date_value text not null,
  importance text not null,
  cultural_context text not null,
  popular_usages jsonb not null default '[]'::jsonb,
  headline_alternatives jsonb not null default '[]'::jsonb,
  caption_ideas jsonb not null default '[]'::jsonb,
  visual_direction text not null,
  avoid_rules text not null,
  prompt_template text not null,
  prompt_building_blocks jsonb not null default '{}'::jsonb,
  master_prompt_template text not null default '',
  is_default_selected boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists selected_days (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  special_day_id uuid not null references special_days(id) on delete cascade,
  sort_order integer not null default 0,
  custom_note text,
  created_at timestamptz not null default now()
);

create table if not exists sector_modifiers (
  id uuid primary key default gen_random_uuid(),
  sector_key text not null unique,
  sector_name text not null,
  description text not null default '',
  visual_cues text not null,
  tone_hints text not null,
  composition_hints text not null default '',
  color_hints text not null default '',
  suitable_elements jsonb not null default '[]'::jsonb,
  avoid_rules_items jsonb not null default '[]'::jsonb,
  avoid_rules text not null,
  prompt_modifier text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists style_modifiers (
  id uuid primary key default gen_random_uuid(),
  style_key text not null unique,
  style_name text not null,
  description text not null,
  visual_cues text not null default '',
  typography_hints text not null default '',
  composition_hints text not null default '',
  color_hints text not null default '',
  best_for jsonb not null default '[]'::jsonb,
  avoid_rules_items jsonb not null default '[]'::jsonb,
  avoid_rules text not null default '',
  prompt_modifier text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  special_day_id uuid references special_days(id) on delete set null,
  type text not null,
  status generation_status not null default 'draft',
  prompt text,
  provider text,
  image_url text,
  thumbnail_url text,
  caption_text text,
  hashtags jsonb not null default '[]'::jsonb,
  error_message text,
  retry_count integer not null default 0,
  approved_at timestamptz,
  story_image_url text,
  story_status text,
  art_direction jsonb,
  design_metadata jsonb,
  prompt_version_refs jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  generation_job_id uuid references generation_jobs(id) on delete set null,
  type text not null,
  file_url text not null,
  thumbnail_url text,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table orders enable row level security;
alter table generation_jobs enable row level security;
alter table assets enable row level security;
alter table credit_transactions enable row level security;
alter table selected_days enable row level security;
alter table special_days enable row level security;
alter table sector_modifiers enable row level security;
alter table style_modifiers enable row level security;

-- Policy'ler (tekrar çalıştırılabilir)
drop policy if exists "users can read own profile" on profiles;
drop policy if exists "users can insert own profile" on profiles;
drop policy if exists "users can update own profile" on profiles;
drop policy if exists "users can read own projects" on projects;
drop policy if exists "users can insert own projects" on projects;
drop policy if exists "users can update own projects" on projects;
drop policy if exists "users can read own orders" on orders;
drop policy if exists "users can read own jobs" on generation_jobs;
drop policy if exists "users can insert own jobs" on generation_jobs;
drop policy if exists "users can update own jobs" on generation_jobs;
drop policy if exists "users can read own assets" on assets;
drop policy if exists "public can read prompt library" on special_days;
drop policy if exists "public can read sector modifiers" on sector_modifiers;
drop policy if exists "public can read style modifiers" on style_modifiers;

create policy "users can read own profile" on profiles
for select using (auth.uid() = id);

create policy "users can insert own profile" on profiles
for insert with check (auth.uid() = id);

create policy "users can update own profile" on profiles
for update using (auth.uid() = id);

create policy "users can read own projects" on projects
for select using (auth.uid() = user_id);

create policy "users can insert own projects" on projects
for insert with check (auth.uid() = user_id);

create policy "users can update own projects" on projects
for update using (auth.uid() = user_id);

create policy "users can read own orders" on orders
for select using (auth.uid() = user_id);

drop policy if exists "users can insert own orders" on orders;
create policy "users can insert own orders" on orders
for insert with check (auth.uid() = user_id);

create policy "users can read own jobs" on generation_jobs
for select using (auth.uid() = user_id);

create policy "users can insert own jobs" on generation_jobs
for insert with check (auth.uid() = user_id);

create policy "users can update own jobs" on generation_jobs
for update using (auth.uid() = user_id);

create policy "users can read own assets" on assets
for select using (
  exists (
    select 1 from projects
    where projects.id = assets.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "public can read prompt library" on special_days
for select using (true);

create policy "public can read sector modifiers" on sector_modifiers
for select using (true);

create policy "public can read style modifiers" on style_modifiers
for select using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- TODO: configure storage bucket policies for logos, generated assets, and thumbnails.

-- =============================================================================
-- Trend Brain (haftalık içerik zekası)
-- Ayrı migration: migrations/20260710_trend_brain.sql — mevcut projede tek sefer çalıştırın.
-- =============================================================================

create table if not exists prompt_versions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('special_day', 'sector', 'style')),
  target_id text not null,
  version_number integer not null,
  snapshot jsonb not null,
  change_summary text,
  source_run_id uuid,
  source_suggestion_id uuid,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  created_by text,
  unique (target_type, target_id, version_number)
);

create index if not exists prompt_versions_active_idx
  on prompt_versions (target_type, target_id, is_active)
  where is_active = true;

create table if not exists trend_brain_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  trigger_type text not null check (trigger_type in ('cron', 'manual')),
  triggered_by text,
  targets_selected integer not null default 0,
  suggestions_created integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists trend_brain_suggestions (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references trend_brain_runs(id) on delete cascade,
  target_type text not null check (target_type in ('special_day', 'sector', 'style')),
  target_id text not null,
  suggestion_type text not null,
  reason text not null,
  current_snapshot jsonb not null,
  suggested_patch jsonb not null,
  confidence_score numeric(4, 3) not null default 0.5,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'applied')),
  research_summary text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists trend_brain_suggestions_status_idx
  on trend_brain_suggestions (status, created_at desc);

create table if not exists performance_aggregates (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  target_type text not null,
  target_id text not null,
  dimension jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  sample_size integer not null default 0,
  computed_at timestamptz not null default now()
);

create index if not exists performance_aggregates_target_idx
  on performance_aggregates (target_type, target_id, period_end desc);

create table if not exists revision_feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references generation_jobs(id) on delete set null,
  user_id uuid references profiles(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  day_id text not null,
  sector text,
  style text,
  reason text,
  signal_type text not null default 'regenerate'
    check (signal_type in ('regenerate', 'manual_feedback')),
  previous_art_direction jsonb,
  previous_prompt_version_refs jsonb,
  created_at timestamptz not null default now()
);

create index if not exists revision_feedback_day_idx
  on revision_feedback (day_id, created_at desc);

alter table generation_jobs
  add column if not exists prompt_version_refs jsonb;

