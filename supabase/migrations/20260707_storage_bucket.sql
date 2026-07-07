-- ADIM 2 — Index'ler bittikten SONRA çalıştır
-- Bucket'ı SQL yerine panelden de açabilirsin: Storage → New bucket → generated-images (Public)

insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do nothing;

-- ADIM 3 — Bucket oluştuktan sonra ayrı sorgu olarak çalıştır

drop policy if exists "Users read own generated images" on storage.objects;

create policy "Users read own generated images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'generated-images'
  and exists (
    select 1
    from projects p
    where p.user_id = auth.uid()
      and (name like p.id::text || '/%' or name = p.id::text)
  )
);
