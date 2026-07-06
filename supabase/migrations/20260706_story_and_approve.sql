-- Mevcut Supabase projesine bu dosyayı SQL Editor'da bir kez çalıştırın.
alter table generation_jobs add column if not exists approved_at timestamptz;
alter table generation_jobs add column if not exists story_image_url text;
alter table generation_jobs add column if not exists story_status text;
