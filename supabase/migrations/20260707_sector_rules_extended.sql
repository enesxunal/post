alter table sector_modifiers
  add column if not exists description text not null default '',
  add column if not exists composition_hints text not null default '',
  add column if not exists color_hints text not null default '',
  add column if not exists suitable_elements jsonb not null default '[]'::jsonb,
  add column if not exists avoid_rules_items jsonb not null default '[]'::jsonb;
