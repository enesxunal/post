-- ADIM 1 — Sadece bu dosyayı çalıştır (tek seferde veya satır satır)
-- Timeout olursa her CREATE INDEX'i ayrı sorgu olarak Run et.

create index if not exists generation_jobs_project_id_idx
  on generation_jobs (project_id);

create index if not exists generation_jobs_user_id_idx
  on generation_jobs (user_id);

create index if not exists generation_jobs_project_status_idx
  on generation_jobs (project_id, status);
