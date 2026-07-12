-- Profil fotoğrafı (varsayılan: marka logosu)
alter table profiles add column if not exists avatar_url text;
