alter table special_days
  add column if not exists prompt_building_blocks jsonb not null default '{}'::jsonb;

alter table special_days
  add column if not exists master_prompt_template text not null default '';
