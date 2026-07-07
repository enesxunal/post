-- Trend Brain: prompt versioning, runs, suggestions, performance, revision signals

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

alter table prompt_versions
  add constraint prompt_versions_run_fk
  foreign key (source_run_id) references trend_brain_runs(id) on delete set null;

alter table prompt_versions
  add constraint prompt_versions_suggestion_fk
  foreign key (source_suggestion_id) references trend_brain_suggestions(id) on delete set null;
