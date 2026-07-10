export type HowToStep = {
  step: number;
  title: string;
  summary: string;
  tips: string[];
  mockup: "mode" | "brand" | "days" | "payment" | "generate" | "revise";
};

export const howToSteps: HowToStep[] = [
  {
    step: 1,
    title: "Hızlı veya detaylı modu seçin",
    summary:
      "İlk ekranda iki seçenek görürsünüz. Acele ediyorsanız Hızlı Başla yeterli; özel başlık veya stil notu yazmak istiyorsanız Detaylı Kurulum'u seçin.",
    tips: [
      "Hızlı modda 30 popüler özel gün önerilir; isterseniz değiştirirsiniz.",
      "Detaylı modda her gün için ayrı başlık ve görsel yönlendirmesi yazabilirsiniz.",
    ],
    mockup: "mode",
  },
  {
    step: 2,
    title: "Marka bilgilerinizi girin",
    summary:
      "İşletme adı, logo, sektör ve marka rengini ekleyin. Logo net ve arka plansız olursa görsele daha profesyonel oturur.",
    tips: [
      "Sektör seçimi görsellerin sahnesini belirler — kafe ile güzellik salonu farklı görünür.",
      "Marka rengi özel gün renklerini ezer değil; dengeli kullanılır.",
    ],
    mockup: "brand",
  },
  {
    step: 3,
    title: "Özel günleri kontrol edin",
    summary:
      "30 günlük paket hazır gelir. İstemediğiniz günü çıkarıp yerine başka gün ekleyebilirsiniz. Kare veya dikey format seçimini burada yapın.",
    tips: [
      "Bayram, kandil, cuma, milli gün ve sektörel günler pakete dahildir.",
      "Detaylı modda gün bazlı kısa not yazarsanız AI o yönde üretir.",
    ],
    mockup: "days",
  },
  {
    step: 4,
    title: "Ödemeyi tamamlayın",
    summary:
      "Tek seferlik ödeme sonrası paneliniz açılır. Abonelik yoktur; ödediğiniz paket ve revizyon kredileri hesabınıza işlenir.",
    tips: [
      "Ödeme sonrası e-posta ile panele yönlendirilirsiniz.",
      "Sayfayı kapatsanız bile hesabınız kayıtlı kalır — Giriş Yap ile devam edin.",
    ],
    mockup: "payment",
  },
  {
    step: 5,
    title: "Panelden tek tek üretin",
    summary:
      "Görseller otomatik oluşmaz; her özel gün kartına tıklayıp Üret butonuna basarsınız. Böylece kontrol sizde kalır, krediniz boşa gitmez.",
    tips: [
      "Önce en önemli günlerden başlamak mantıklıdır — örneğin yaklaşan bayram.",
      "Üretim arka planda devam eder; sayfayı yenilemenize gerek kalmaz.",
    ],
    mockup: "generate",
  },
  {
    step: 6,
    title: "Beğenin, revize edin, indirin",
    summary:
      "Görseli onaylayın, PNG indirin ve sosyal medyada paylaşın. Beğenmediyseniz revizyon notu yazıp yeniden üretin — layout veya sahne değişir.",
    tips: [
      "Revizyon notunda somut yazın: «daha sıcak ışık», «başlık daha büyük» gibi.",
      "Caption paketi aldıysanız onay sonrası metin ve story otomatik hazırlanır.",
    ],
    mockup: "revise",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
  category: "genel" | "odeme" | "uretim" | "kullanim";
};

export const faqItems: FaqItem[] = [
  {
    category: "genel",
    question: "Poust nedir?",
    answer:
      "KOBİ'ler için özel gün sosyal medya postlarını markanıza göre hazırlayan bir platformdur. Logo, sektör ve stilinize uygun görseller üretirsiniz.",
  },
  {
    category: "odeme",
    question: "Bu sistem abonelik mi?",
    answer:
      "Hayır. Ana paket tek seferlik satın alınır. Aylık zorunlu ödeme veya otomatik yenileme yoktur.",
  },
  {
    category: "odeme",
    question: "Pakette neler var?",
    answer:
      "30 özel gün postu hakkı, 10 revizyon kredisi, logo yerleşimi ve panel erişimi dahildir. Caption ve story isteğe bağlı ek paketlerdir.",
  },
  {
    category: "uretim",
    question: "Görseller ödeme sonrası hemen mi oluşuyor?",
    answer:
      "Hayır — bilinçli olarak böyle tasarlandı. Panelde boş kartlar açılır; her kart için Üret'e basarak tek tek oluşturursunuz. Böylece hangi günü ne zaman üreteceğinize siz karar verirsiniz.",
  },
  {
    category: "uretim",
    question: "Üretim ne kadar sürer?",
    answer:
      "Her görsel genelde birkaç dakika içinde hazır olur. Arka planda çalışır; sayfadan çıksanız bile üretim devam eder ve hazır olunca panelde görünür.",
  },
  {
    category: "kullanim",
    question: "Logoyu kendim mi yerleştiriyorum?",
    answer:
      "Hayır. Yüklediğiniz logo otomatik ve orantılı şekilde en uygun alana eklenir. Elle Photoshop yapmanıza gerek kalmaz.",
  },
  {
    category: "kullanim",
    question: "Revizyon nasıl çalışır?",
    answer:
      "Beğenmediğiniz görselde kısa bir not yazarsınız — örneğin «daha sıcak ton» veya «daha az kalabalık». Sistem aynı gün ve markayı koruyarak farklı kompozisyonla yeniden üretir.",
  },
  {
    category: "kullanim",
    question: "Caption ve story ne zaman gelir?",
    answer:
      "Caption veya story ek paketi aldıysanız, postu onayladıktan sonra metin ve dikey story görseli otomatik hazırlanır.",
  },
  {
    category: "genel",
    question: "Hangi sektörler destekleniyor?",
    answer:
      "Güzellik salonu, kafe, diş kliniği, emlak, eğitim, butik, spor salonu ve daha birçok KOBİ sektörü desteklenir. Her sektör için görseller o alana özel sahne içerir.",
  },
  {
    category: "kullanim",
    question: "Sayfayı kapatırsam üretim durur mu?",
    answer:
      "Hayır. Üretim sunucuda devam eder. Daha sonra Giriş Yap ile panele dönüp hazır görselleri indirebilirsiniz.",
  },
];

export const faqCategoryLabels: Record<FaqItem["category"], string> = {
  genel: "Genel",
  odeme: "Ödeme & paket",
  uretim: "Üretim",
  kullanim: "Kullanım",
};
