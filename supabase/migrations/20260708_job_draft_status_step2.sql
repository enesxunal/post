-- ADIM 2 — ADIM 1 başarılı olduktan SONRA ayrı sorgu olarak çalıştır

update generation_jobs
set status = 'draft'
where status = 'queued'
  and image_url is null;
