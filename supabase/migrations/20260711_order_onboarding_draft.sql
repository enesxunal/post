-- Sipariş oluşturulurken onboarding bilgisi kaydedilir;
-- EFT onayı veya ödeme sonrası proje oluşturmak için kullanılır.
alter table orders
  add column if not exists onboarding_draft jsonb;
