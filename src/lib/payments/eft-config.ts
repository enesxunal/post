export const EFT_BANK_DETAILS = {
  accountHolder: process.env.EFT_ACCOUNT_HOLDER ?? "Enes Ünal",
  iban: process.env.EFT_IBAN ?? "TR30 0015 7000 0000 0088 1765 55",
  bankName: process.env.EFT_BANK_NAME ?? "Enpara",
  description: process.env.EFT_PAYMENT_NOTE ?? "Açıklama kısmına e-posta adresinizi yazın.",
} as const;
