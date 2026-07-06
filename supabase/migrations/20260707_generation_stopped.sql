alter table projects
  add column if not exists generation_stopped_at timestamptz;
