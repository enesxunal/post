create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

comment on table public.contact_messages is 'İletişim formu mesajları — yalnızca service role API ile yazılır';
