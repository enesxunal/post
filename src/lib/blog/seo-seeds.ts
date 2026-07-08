import type { SectorKey } from "@/types/domain";

export type DaySeoSeed = {
  dayId: string;
  label: string;
  searchTerms: string[];
  /** İnsanların aradığı long-tail örnekleri */
  longTails: [string, string];
};

export type SectorSeoSeed = {
  sector: SectorKey;
  label: string;
  searchTerms: string[];
  longTails: [string, string];
};

/** Özel gün arama niyetleri — SEO anahtar kelime kaynağı */
export const DAY_SEO_SEEDS: DaySeoSeed[] = [
  {
    dayId: "friday-blessing",
    label: "Hayırlı Cumalar",
    searchTerms: ["cuma mesajları", "hayırlı cumalar mesajı", "cuma kutlama görseli", "cuma postu"],
    longTails: ["Cuma mesajları nasıl yazılır? İşletmeler için örnekler", "Hayırlı Cumalar Instagram postu: hazır görsel fikirleri"],
  },
  {
    dayId: "30-agustos",
    label: "30 Ağustos Zafer Bayramı",
    searchTerms: ["30 ağustos özel postlar", "30 ağustos kutlama mesajı", "zafer bayramı görseli", "30 ağustos instagram"],
    longTails: ["30 Ağustos özel postlar: işletmeler için kutlama rehberi", "Zafer Bayramı Instagram hikayesi ve post şablonları"],
  },
  {
    dayId: "29-ekim",
    label: "29 Ekim Cumhuriyet Bayramı",
    searchTerms: ["29 ekim kutlama mesajı", "cumhuriyet bayramı postu", "29 ekim instagram", "cumhuriyet bayramı görseli"],
    longTails: ["29 Ekim Cumhuriyet Bayramı işletme postu nasıl hazırlanır?", "Cumhuriyet Bayramı sosyal medya içerik fikirleri"],
  },
  {
    dayId: "ramadan-feast",
    label: "Ramazan Bayramı",
    searchTerms: ["ramazan bayramı mesajı", "bayramınız mübarek olsun postu", "ramazan bayramı görseli", "işletme bayram mesajı"],
    longTails: ["Ramazan Bayramı işletme mesajı örnekleri", "Bayramınız mübarek olsun Instagram postu rehberi"],
  },
  {
    dayId: "kurban-bayrami",
    label: "Kurban Bayramı",
    searchTerms: ["kurban bayramı mesajı", "kurban bayramı postu", "bayram kutlama görseli", "kurban bayramı instagram"],
    longTails: ["Kurban Bayramı işletmeler için saygılı mesaj örnekleri", "Kurban Bayramı sosyal medya postu nasıl yapılır?"],
  },
  {
    dayId: "new-year",
    label: "Yılbaşı",
    searchTerms: ["yeni yıl mesajı işletme", "mutlu yıllar postu", "yılbaşı kutlama görseli", "yeni yıl instagram"],
    longTails: ["Yılbaşı işletme kutlama mesajı örnekleri", "Mutlu yıllar Instagram postu: markanıza özel fikirler"],
  },
  {
    dayId: "mothers-day",
    label: "Anneler Günü",
    searchTerms: ["anneler günü mesajı", "anneler günü postu", "anneler günü görseli", "anneler günü instagram"],
    longTails: ["Anneler Günü işletme postu nasıl hazırlanır?", "Anneler Günü Instagram kutlama mesajı örnekleri"],
  },
  {
    dayId: "fathers-day",
    label: "Babalar Günü",
    searchTerms: ["babalar günü mesajı", "babalar günü postu", "babalar günü görseli", "babalar günü instagram"],
    longTails: ["Babalar Günü işletmeler için kutlama postu", "Babalar Günü sosyal medya mesajı örnekleri"],
  },
  {
    dayId: "teachers-day",
    label: "Öğretmenler Günü",
    searchTerms: ["öğretmenler günü mesajı", "öğretmenler günü postu", "24 kasım kutlama", "öğretmenler günü görseli"],
    longTails: ["Öğretmenler Günü işletme / eğitim kurumu postu", "24 Kasım Öğretmenler Günü Instagram içerik fikirleri"],
  },
  {
    dayId: "womens-day",
    label: "8 Mart Dünya Kadınlar Günü",
    searchTerms: ["8 mart mesajı", "kadınlar günü postu", "dünya kadınlar günü görseli", "8 mart instagram"],
    longTails: ["8 Mart Dünya Kadınlar Günü işletme postu", "Kadınlar Günü sosyal medya kutlama mesajı örnekleri"],
  },
  {
    dayId: "valentines-day",
    label: "Sevgililer Günü",
    searchTerms: ["sevgililer günü kampanya", "14 şubat postu", "sevgililer günü görseli", "sevgililer günü instagram"],
    longTails: ["Sevgililer Günü işletme kampanya postu nasıl yapılır?", "14 Şubat Instagram hikayesi ve feed fikirleri"],
  },
  {
    dayId: "19-mayis",
    label: "19 Mayıs",
    searchTerms: ["19 mayıs kutlama mesajı", "19 mayıs postu", "gençlik ve spor bayramı görseli", "19 mayıs instagram"],
    longTails: ["19 Mayıs Atatürk'ü Anma işletme postu", "19 Mayıs sosyal medya içerik örnekleri"],
  },
  {
    dayId: "23-nisan",
    label: "23 Nisan",
    searchTerms: ["23 nisan kutlama mesajı", "23 nisan postu", "çocuk bayramı görseli", "23 nisan instagram"],
    longTails: ["23 Nisan Ulusal Egemenlik ve Çocuk Bayramı postu", "23 Nisan işletmeler için sosyal medya mesajı"],
  },
  {
    dayId: "1-mayis",
    label: "1 Mayıs",
    searchTerms: ["1 mayıs kutlama", "emek ve dayanışma günü postu", "1 mayıs mesajı", "1 mayıs görseli"],
    longTails: ["1 Mayıs Emek ve Dayanışma Günü işletme postu", "1 Mayıs sosyal medya paylaşımı örnekleri"],
  },
  {
    dayId: "15-temmuz",
    label: "15 Temmuz",
    searchTerms: ["15 temmuz anma mesajı", "15 temmuz postu", "demokrasi ve milli birlik günü", "15 temmuz görseli"],
    longTails: ["15 Temmuz işletmeler için saygılı anma postu", "15 Temmuz Demokrasi Günü sosyal medya içeriği"],
  },
  {
    dayId: "regaib-kandili",
    label: "Regaib Kandili",
    searchTerms: ["regaib kandili mesajı", "regaib kandili postu", "kandil mesajları", "regaib kandili görseli"],
    longTails: ["Regaib Kandili hayırlı mesaj örnekleri", "Regaib Kandili Instagram postu nasıl hazırlanır?"],
  },
  {
    dayId: "mirac-kandili",
    label: "Miraç Kandili",
    searchTerms: ["miraç kandili mesajı", "miraç kandili postu", "kandil kutlama", "miraç kandili görseli"],
    longTails: ["Miraç Kandili işletme mesajı örnekleri", "Miraç Kandili sosyal medya paylaşımı"],
  },
  {
    dayId: "berat-kandili",
    label: "Berat Kandili",
    searchTerms: ["berat kandili mesajı", "berat kandili postu", "kandiliniz mübarek olsun", "berat kandili görseli"],
    longTails: ["Berat Kandili hayırlı mesaj örnekleri", "Berat Kandili Instagram post fikirleri"],
  },
  {
    dayId: "kadir-gecesi",
    label: "Kadir Gecesi",
    searchTerms: ["kadir gecesi mesajı", "kadir gecesi postu", "kadir geceniz mübarek", "kadir gecesi görseli"],
    longTails: ["Kadir Gecesi işletmeler için saygılı mesaj", "Kadir Gecesi sosyal medya içeriği nasıl olur?"],
  },
  {
    dayId: "mevlid-kandili",
    label: "Mevlid Kandili",
    searchTerms: ["mevlid kandili mesajı", "mevlid kandili postu", "mevlid kandili görseli", "kandil mesajı"],
    longTails: ["Mevlid Kandili kutlama mesajı örnekleri", "Mevlid Kandili Instagram postu rehberi"],
  },
  {
    dayId: "asure-gunu",
    label: "Aşure Günü",
    searchTerms: ["aşure günü mesajı", "aşure günü postu", "aşure paylaşımı", "aşure günü görseli"],
    longTails: ["Aşure Günü işletme / kafe postu", "Aşure Günü sosyal medya paylaşım fikirleri"],
  },
  {
    dayId: "black-friday",
    label: "Black Friday",
    searchTerms: ["black friday postu", "kara cuma kampanya görseli", "black friday instagram", "indirim postu"],
    longTails: ["Black Friday işletme kampanya postu nasıl yapılır?", "Kara Cuma Instagram reklam ve feed fikirleri"],
  },
  {
    dayId: "back-to-school",
    label: "Okula Dönüş",
    searchTerms: ["okula dönüş kampanya", "back to school postu", "okul alışverişi görseli", "okula dönüş instagram"],
    longTails: ["Okula dönüş işletme kampanya içeriği", "Back to school Instagram post örnekleri"],
  },
  {
    dayId: "world-coffee-day",
    label: "Dünya Kahve Günü",
    searchTerms: ["dünya kahve günü", "kahve günü postu", "kafe kutlama görseli", "coffee day instagram"],
    longTails: ["Dünya Kahve Günü kafe postu nasıl hazırlanır?", "Kahve günü sosyal medya içerik fikirleri"],
  },
  {
    dayId: "dentists-day",
    label: "Diş Hekimleri Günü",
    searchTerms: ["diş hekimleri günü", "diş kliniği kutlama postu", "diş hekimi günü mesajı", "dental day post"],
    longTails: ["Diş Hekimleri Günü klinik Instagram postu", "Diş hekimliği işletmeleri için kutlama mesajı"],
  },
  {
    dayId: "lawyers-day",
    label: "Avukatlar Günü",
    searchTerms: ["avukatlar günü mesajı", "avukatlar günü postu", "hukuk bürosu kutlama", "avukatlar günü görseli"],
    longTails: ["Avukatlar Günü hukuk bürosu sosyal medya postu", "Avukatlar Günü profesyonel mesaj örnekleri"],
  },
  {
    dayId: "accountants-day",
    label: "Muhasebeciler Günü",
    searchTerms: ["muhasebeciler günü", "muhasebe ofisi postu", "muhasebeciler günü mesajı", "mali müşavir günü"],
    longTails: ["Muhasebeciler Günü ofis Instagram kutlaması", "Muhasebe işletmeleri için özel gün postu"],
  },
  {
    dayId: "tourim-week",
    label: "Turizm Haftası",
    searchTerms: ["turizm haftası", "otel kutlama postu", "turizm haftası mesajı", "turizm sosyal medya"],
    longTails: ["Turizm Haftası otel ve acente postu", "Turizm işletmeleri için haftalık içerik fikirleri"],
  },
  {
    dayId: "world-beauty-day",
    label: "Dünya Güzellik Günü",
    searchTerms: ["dünya güzellik günü", "güzellik salonu postu", "beauty day instagram", "kuaför kutlama görseli"],
    longTails: ["Dünya Güzellik Günü salon Instagram postu", "Güzellik işletmeleri için özel gün içeriği"],
  },
  {
    dayId: "uc-aylar-baslangici",
    label: "Üç Ayların Başlangıcı",
    searchTerms: ["üç aylar mesajı", "üç ayların başlangıcı", "üç aylar postu", "mübarek üç aylar"],
    longTails: ["Üç Ayların Başlangıcı hayırlı mesaj örnekleri", "Üç aylar işletme sosyal medya paylaşımı"],
  },
  {
    dayId: "hicri-yilbasi",
    label: "Hicri Yılbaşı",
    searchTerms: ["hicri yılbaşı mesajı", "hicri yeni yıl", "hicri yılbaşı postu", "mübarek hicri yıl"],
    longTails: ["Hicri Yılbaşı işletme kutlama mesajı", "Hicri yılbaşında sosyal medya paylaşımı"],
  },
  {
    dayId: "medical-day",
    label: "Tıp Bayramı",
    searchTerms: ["tıp bayramı mesajı", "tıp bayramı postu", "14 mart tıp bayramı", "doktor kutlama görseli"],
    longTails: ["Tıp Bayramı klinik / sağlık işletmesi postu", "14 Mart Tıp Bayramı sosyal medya mesajı"],
  },
  {
    dayId: "nurses-day",
    label: "Hemşireler Günü",
    searchTerms: ["hemşireler günü mesajı", "hemşireler günü postu", "12 mayıs hemşireler günü", "hemşire kutlama"],
    longTails: ["Hemşireler Günü sağlık kurumu postu", "Hemşireler Günü Instagram kutlama örnekleri"],
  },
  {
    dayId: "animal-protection-day",
    label: "Dünya Hayvanları Koruma Günü",
    searchTerms: ["hayvanları koruma günü", "veteriner klinik postu", "4 ekim hayvanlar günü", "pet shop kutlama"],
    longTails: ["Hayvanları Koruma Günü veteriner postu", "Pet işletmeleri için 4 Ekim içerik fikirleri"],
  },
  {
    dayId: "new-season",
    label: "Yeni Sezon",
    searchTerms: ["yeni sezon kampanya", "yeni sezon postu", "koleksiyon lansmanı görseli", "yeni sezon instagram"],
    longTails: ["Yeni sezon işletme kampanya postu", "Butik ve e-ticaret için yeni sezon içeriği"],
  },
  {
    dayId: "summer-season",
    label: "Yaz Sezonu",
    searchTerms: ["yaz kampanyası postu", "yaz sezonu görseli", "yaz indirimi instagram", "yaz menü duyurusu"],
    longTails: ["Yaz sezonu işletme sosyal medya kampanyası", "Yaz indirimi post ve hikaye fikirleri"],
  },
  {
    dayId: "winter-campaign",
    label: "Kış Kampanyası",
    searchTerms: ["kış kampanyası postu", "kış indirimi görseli", "kış menü duyurusu", "kış seansı"],
    longTails: ["Kış kampanyası Instagram postu nasıl yapılır?", "Kış sezonu işletme içerik fikirleri"],
  },
  {
    dayId: "year-end-campaign",
    label: "Yıl Sonu Kampanyası",
    searchTerms: ["yıl sonu kampanya", "yıl sonu indirim postu", "yıl sonu satış görseli", "aralık kampanya"],
    longTails: ["Yıl sonu kampanya sosyal medya içerikleri", "Aralık ayı işletme satış postu örnekleri"],
  },
  {
    dayId: "pharmacists-day",
    label: "Eczacılar Günü",
    searchTerms: ["eczacılar günü mesajı", "eczacılar günü postu", "eczane kutlama", "25 eylül eczacılar günü"],
    longTails: ["Eczacılar Günü eczane Instagram postu", "Eczacılar Günü profesyonel mesaj örnekleri"],
  },
  {
    dayId: "architects-day",
    label: "Mimarlar Günü",
    searchTerms: ["mimarlar günü", "mimarlık ofisi postu", "mimarlar günü mesajı", "mimar kutlama"],
    longTails: ["Mimarlar Günü mimarlık ofisi sosyal medya postu", "Mimarlar Günü profesyonel kutlama mesajı"],
  },
  {
    dayId: "world-physio-day",
    label: "Dünya Fizyoterapistler Günü",
    searchTerms: ["fizyoterapistler günü", "fizyo klinik postu", "fizyoterapi kutlama", "dünya fizyo günü"],
    longTails: ["Fizyoterapistler Günü klinik Instagram postu", "Fizyoterapi işletmeleri için özel gün içeriği"],
  },
  {
    dayId: "world-vet-day",
    label: "Dünya Veteriner Hekimler Günü",
    searchTerms: ["veteriner hekimler günü", "veteriner klinik postu", "dünya veteriner günü", "vet day mesajı"],
    longTails: ["Veteriner Hekimler Günü klinik postu", "Veteriner işletmeleri için kutlama içeriği"],
  },
];

/** Meslek / sektör arama niyetleri */
export const SECTOR_SEO_SEEDS: SectorSeoSeed[] = [
  {
    sector: "beauty",
    label: "Güzellik salonu",
    searchTerms: ["güzellik salonu postları", "kuaför instagram", "salon özel gün görseli", "güzellik salonu sosyal medya"],
    longTails: ["Güzellik salonu için özel gün postları nasıl hazırlanır?", "Kuaför ve güzellik salonu Instagram içerik takvimi"],
  },
  {
    sector: "cafe",
    label: "Kafe / restoran",
    searchTerms: ["kafe instagram postları", "restoran özel gün görseli", "kafe cuma mesajı", "restoran sosyal medya"],
    longTails: ["Kafe ve restoran için özel gün post fikirleri", "Restoran Instagram'da bayram ve cuma paylaşımları"],
  },
  {
    sector: "dental",
    label: "Diş kliniği",
    searchTerms: ["diş kliniği postu", "diş hekimi instagram", "dental klinik sosyal medya", "diş kliniği bayram mesajı"],
    longTails: ["Diş kliniği özel gün ve bayram postları", "Diş hekimliği Instagram içerik örnekleri"],
  },
  {
    sector: "real-estate",
    label: "Emlak ofisi",
    searchTerms: ["emlak ofisi postu", "emlakçı instagram", "gayrimenkul özel gün görseli", "emlak sosyal medya"],
    longTails: ["Emlak ofisi için özel gün Instagram postları", "Gayrimenkul işletmeleri sosyal medya takvimi"],
  },
  {
    sector: "agency",
    label: "Dijital ajans",
    searchTerms: ["ajans özel gün postu", "dijital ajans instagram", "ajans bayram mesajı", "kreatif ajans sosyal medya"],
    longTails: ["Dijital ajans için kendi marka özel gün postları", "Ajans Instagram'da premium kutlama paylaşımları"],
  },
  {
    sector: "education",
    label: "Eğitim kurumu",
    searchTerms: ["okul özel gün postu", "kurs instagram", "eğitim kurumu bayram mesajı", "dershane sosyal medya"],
    longTails: ["Eğitim kurumları için özel gün ve bayram postları", "Okul / kurs Instagram içerik takvimi"],
  },
  {
    sector: "boutique",
    label: "Butik / mağaza",
    searchTerms: ["butik instagram postları", "mağaza özel gün görseli", "mağaza bayram mesajı", "perakende sosyal medya"],
    longTails: ["Butik ve mağaza için özel gün postları", "Mağaza Instagram bayram ve kampanya paylaşımları"],
  },
  {
    sector: "fitness",
    label: "Spor salonu",
    searchTerms: ["spor salonu postu", "gym instagram", "fitness özel gün görseli", "pilates stüdyo sosyal medya"],
    longTails: ["Spor salonu özel gün ve bayram Instagram postları", "Fitness stüdyosu sosyal medya içerik fikirleri"],
  },
  {
    sector: "nutrition",
    label: "Diyetisyen / sağlık",
    searchTerms: ["diyetisyen instagram", "beslenme danışmanı postu", "wellness özel gün görseli", "sağlık koçu sosyal medya"],
    longTails: ["Diyetisyen için özel gün sosyal medya postları", "Beslenme ve wellness Instagram içerik takvimi"],
  },
  {
    sector: "auto-service",
    label: "Oto servis",
    searchTerms: ["oto servis postu", "oto yıkama instagram", "servis özel gün mesajı", "araç bakımı sosyal medya"],
    longTails: ["Oto servis işletmeleri için özel gün postları", "Oto yıkama / servis Instagram kutlama paylaşımları"],
  },
  {
    sector: "veterinary",
    label: "Veteriner",
    searchTerms: ["veteriner klinik postu", "veteriner instagram", "pet klinik bayram mesajı", "veteriner sosyal medya"],
    longTails: ["Veteriner klinikleri için özel gün postları", "Pet klinik Instagram bayram ve cuma paylaşımları"],
  },
  {
    sector: "law",
    label: "Hukuk bürosu",
    searchTerms: ["hukuk bürosu postu", "avukatlık ofisi instagram", "hukuk bürosu bayram mesajı", "avukat sosyal medya"],
    longTails: ["Hukuk bürosu için kurumsal özel gün postları", "Avukatlık ofisleri Instagram kutlama örnekleri"],
  },
  {
    sector: "accounting",
    label: "Muhasebe / mali müşavir",
    searchTerms: ["muhasebe ofisi postu", "mali müşavir instagram", "muhasebe bayram mesajı", "smmm sosyal medya"],
    longTails: ["Muhasebe ofisleri için özel gün postları", "Mali müşavir Instagram kurumsal içerik fikirleri"],
  },
  {
    sector: "hotel",
    label: "Otel / turizm",
    searchTerms: ["otel instagram postları", "otel bayram mesajı", "turizm işletmesi görseli", "otel özel gün paylaşımı"],
    longTails: ["Otel ve turizm işletmeleri için özel gün postları", "Otel Instagram bayram ve sezon içerikleri"],
  },
  {
    sector: "photography",
    label: "Fotoğraf stüdyosu",
    searchTerms: ["fotoğraf stüdyosu postu", "fotoğrafçı instagram", "stüdyo özel gün görseli", "düğün fotoğrafçısı sosyal medya"],
    longTails: ["Fotoğraf stüdyosu özel gün Instagram paylaşımları", "Fotoğrafçı markaları için bayram ve kampanya postları"],
  },
  {
    sector: "construction",
    label: "İnşaat / mimarlık",
    searchTerms: ["inşaat firması postu", "mimarlık ofisi instagram", "müteahhit bayram mesajı", "inşaat sosyal medya"],
    longTails: ["İnşaat ve mimarlık firmaları için özel gün postları", "Müteahhit Instagram kurumsal kutlama içerikleri"],
  },
  {
    sector: "cleaning",
    label: "Temizlik şirketi",
    searchTerms: ["temizlik şirketi postu", "temizlik firması instagram", "temizlik bayram mesajı", "hijyen hizmeti sosyal medya"],
    longTails: ["Temizlik şirketleri için özel gün postları", "Temizlik firması Instagram içerik takvimi"],
  },
  {
    sector: "flower-gift",
    label: "Çiçekçi / hediyelik",
    searchTerms: ["çiçekçi instagram", "hediyelik mağaza postu", "çiçekçi özel gün görseli", "hediye dükkanı sosyal medya"],
    longTails: ["Çiçekçi ve hediyelik için özel gün postları", "Anneler Günü / Sevgililer Günü çiçekçi Instagram"],
  },
  {
    sector: "barber",
    label: "Berber / kuaför",
    searchTerms: ["berber instagram postları", "erkek kuaförü postu", "berber özel gün mesajı", "barbershop sosyal medya"],
    longTails: ["Berber ve erkek kuaförü özel gün postları", "Barbershop Instagram bayram / cuma paylaşımları"],
  },
  {
    sector: "jewelry",
    label: "Kuyumcu / aksesuar",
    searchTerms: ["kuyumcu instagram", "mücevher mağaza postu", "kuyumcu bayram mesajı", "aksesuar özel gün görseli"],
    longTails: ["Kuyumcu ve aksesuar için özel gün postları", "Mücevher markaları Instagram bayram içerikleri"],
  },
  {
    sector: "ecommerce",
    label: "E-ticaret",
    searchTerms: ["e-ticaret özel gün postu", "online mağaza instagram", "e ticaret kampanya görseli", "d2c sosyal medya"],
    longTails: ["E-ticaret markaları için özel gün post takvimi", "Online mağaza bayram ve Black Friday içerikleri"],
  },
  {
    sector: "other",
    label: "Yerel hizmet işletmesi",
    searchTerms: ["küçük işletme instagram", "esnaf sosyal medya postu", "yerel işletme bayram mesajı", "kobi özel gün görseli"],
    longTails: ["Küçük işletmeler için özel gün Instagram postları", "Esnaf ve KOBİ sosyal medya kutlama rehberi"],
  },
];
