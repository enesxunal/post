alter table generation_jobs
  add column if not exists art_direction jsonb;

alter table generation_jobs
  add column if not exists design_metadata jsonb;
