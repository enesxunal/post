alter table style_modifiers
  add column if not exists visual_cues text not null default '',
  add column if not exists typography_hints text not null default '',
  add column if not exists composition_hints text not null default '',
  add column if not exists color_hints text not null default '',
  add column if not exists best_for jsonb not null default '[]'::jsonb,
  add column if not exists avoid_rules_items jsonb not null default '[]'::jsonb;
