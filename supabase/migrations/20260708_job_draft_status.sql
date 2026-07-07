-- ADIM 1 — Sadece bu satırı çalıştır, Success gör, sonra ADIM 2'ye geç
alter type generation_status add value if not exists 'draft';
