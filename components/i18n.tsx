"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "tr";

type Content = {
  nav: { about: string; skills: string; work: string; experience: string; contact: string; blog: string };
  hero: {
    meta: [string, string, string];
    hint: string;
    frames: { kicker: string; word: string; line: string }[];
  };
  about: {
    eyebrow: string;
    leadPre: string;
    leadEm: string;
    leadPost: string;
    body: string;
    statLabels: [string, string, string];
  };
  skills: {
    eyebrow: string;
    title: string;
    hint: string;
    items: { content: string; category: string }[];
  };
  work: { eyebrow: string; title: string; items: { title: string; desc: string }[] };
  experience: {
    eyebrow: string;
    title: string;
    years: string[];
    roles: string[];
    descs: string[];
  };
  contact: { eyebrow: string; title1: string; title2pre: string; title2ital: string; resume: string };
  footer: { left: string; right: string };
  request: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    projectType: string;
    projectTypes: string[];
    budget: string;
    budgets: string[];
    details: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    back: string;
    required: string;
  };
  blog: {
    title: string;
    subtitle: string;
    readTime: string;
    back: string;
    noPosts: string;
  };
};

const en: Content = {
  nav: { about: "About", skills: "Skills", work: "Work", experience: "Experience", contact: "Contact", blog: "Blog" },
  hero: {
    meta: ["Computer Engineer", "", ""],
    hint: "Scroll or pause",
    frames: [
      { kicker: "Engineering", word: "End-to-End", line: "digital architectures." },
      { kicker: "Mobile", word: "Seamless", line: "mobile experiences." },
      { kicker: "Systems", word: "Custom", line: "and intelligent ERPs." },
      { kicker: "IoT", word: "Connecting", line: "physical worlds with code." },
      { kicker: "Samet Güler", word: "Bringing", line: "ideas into reality." },
    ],
  },
  about: {
    eyebrow: "About",
    leadPre: "I’m a computer engineer building custom ",
    leadEm: "ERP",
    leadPost: " solutions for companies and individuals. From web to mobile, database to DevOps, I love shipping end to end.",
    body: "I hold a Computer Engineering degree from Düzce University and currently work at Mukansoft, part of Mukan Group. For around five years I’ve been building web and mobile applications, focusing on scalable systems and clean data models — with a real interest in IoT.",
    statLabels: ["Years of experience", "Technologies & tools", "Platforms · web & mobile & desktop"],
  },
  skills: {
    eyebrow: "Stack",
    title: "Tools in orbit",
    hint: "Tap a node to explore — and see what it pairs with.",
    items: [
      { content: "APIs, ERP services and real-time systems. The backbone of my backend work.", category: "Backend" },
      { content: "Modern, component-based web interfaces and admin panels.", category: "Web" },
      { content: "Fluid, production-ready apps for iOS and Android from a single codebase.", category: "Mobile" },
      { content: "Flutter’s language — clean, maintainable mobile code.", category: "Language" },
      { content: "Native iOS development and platform-specific experiences.", category: "iOS" },
      { content: "Modern, native Android UIs built with Jetpack Compose.", category: "Android" },
      { content: "PostgreSQL, MSSQL and MySQL — schema design, query tuning and data modeling.", category: "Database" },
      { content: "Deployment, release management and server/database operations.", category: "Infra" },
      { content: "Connected systems that collect device data, plus automation.", category: "Systems" },
    ],
  },
  work: {
    eyebrow: "Selected Work",
    title: "Things I’ve built",
    items: [
      {
        title: "Ankara Metro — Stock & Parts Tracking",
        desc: "A comprehensive stock and spare-parts tracking app for the Ankara Metro — inventory, movements and reporting in one place.",
      },
      {
        title: "Mukansoft — Enterprise ERP",
        desc: "End-to-end ERP solutions tailored to companies and individuals, paired with web admin panels and mobile apps.",
      },
      {
        title: "Mobile App Development",
        desc: "Cross-platform apps with Flutter, plus native iOS and Android with Swift and Kotlin (Jetpack Compose).",
      },
      {
        title: "Web & Admin Panels",
        desc: "Modern web apps and data-driven admin panels that run real business processes.",
      },
    ],
  },
  experience: {
    eyebrow: "Career",
    title: "Where I’ve been",
    years: ["Now", "Internship", "Internship"],
    roles: ["Computer Engineer", "Software Intern", "Software Intern"],
    descs: [
      "At Mukan Group, building custom ERP, web and mobile apps for businesses — end to end, including backend, database and deployment.",
      "Contributed to software development at TCDD Teknik, gaining hands-on experience with enterprise systems.",
      "Internship at Bilsoft Yazılım — my first professional experience in commercial software and databases.",
    ],
  },
  contact: {
    eyebrow: "Get in touch",
    title1: "Let’s build",
    title2pre: "something ",
    title2ital: "great.",
    resume: "Resume",
  },
  footer: { left: "© 2026 Samet Güler — All rights reserved", right: "Designed & built with care" },
  request: {
    title: "Request a Service",
    subtitle: "Tell me about your project and let's build it together.",
    name: "Full Name / Company",
    email: "Email Address",
    phone: "Phone Number (Optional)",
    projectType: "Project Type",
    projectTypes: ["Web Application", "Mobile Application", "Enterprise ERP", "IoT / Automation", "Other"],
    budget: "Estimated Budget",
    budgets: ["Select range...", "Micro (< $2,500)", "Growth ($2,500 - $10,000)", "Enterprise ($10,000+)", "Not decided"],
    details: "Project Details & Goals",
    submit: "Submit Request",
    submitting: "Sending...",
    successTitle: "Request Received!",
    successDesc: "Thank you! I will get back to you within 24 hours.",
    back: "Back to Home",
    required: "This field is required",
  },
  blog: {
    title: "Blog",
    subtitle: "Thoughts, tutorials, and technical notes on engineering.",
    readTime: "min read",
    back: "Back to Home",
    noPosts: "No posts found in this language yet.",
  },
};

const tr: Content = {
  nav: { about: "Hakkımda", skills: "Yetenekler", work: "İşler", experience: "Deneyim", contact: "İletişim", blog: "Blog" },
  hero: {
    meta: ["Bilgisayar Mühendisi", "", ""],
    hint: "Kaydır veya bekle",
    frames: [
      { kicker: "Mühendislik", word: "Uçtan Uca", line: "dijital mimariler." },
      { kicker: "Mobil", word: "Sınırları Aşan", line: "akıcı uygulamalar." },
      { kicker: "Sistemler", word: "İşletmelere Özel", line: "akıllı ERP çözümleri." },
      { kicker: "IoT", word: "Fiziksel Dünyayı", line: "kodla birleştirmek." },
      { kicker: "Samet Güler", word: "Fikirleri", line: "gerçeğe dönüştürelim." },
    ],
  },
  about: {
    eyebrow: "Hakkımda",
    leadPre: "İşletmelere ve kişilere özel ",
    leadEm: "ERP",
    leadPost: " çözümleri geliştiren bir bilgisayar mühendisiyim. Web’den mobile, veritabanından DevOps’a kadar uçtan uca üretmeyi seviyorum.",
    body: "Düzce Üniversitesi Bilgisayar Mühendisliği mezunuyum ve şu anda Mukan Group bünyesindeki Mukansoft’ta çalışıyorum. Yaklaşık beş yıldır web ve mobil uygulamalar geliştiriyor, ölçeklenebilir sistemler ve temiz veri modelleri üzerine kafa yoruyorum. IoT sistemlerine de ayrı bir ilgim var.",
    statLabels: ["Yıllık deneyim", "Teknoloji & araç", "Platform · web & mobil & desktop"],
  },
  skills: {
    eyebrow: "Teknolojiler",
    title: "Yörüngedeki araçlar",
    hint: "Keşfetmek için bir düğüme dokun — neyle uyumlu olduğunu gör.",
    items: [
      { content: "API’ler, ERP servisleri ve gerçek zamanlı sistemler. Backend çalışmalarımın bel kemiği.", category: "Backend" },
      { content: "Modern, bileşen tabanlı web arayüzleri ve yönetim panelleri.", category: "Web" },
      { content: "Tek kod tabanından iOS ve Android’e akıcı, üretime hazır mobil uygulamalar.", category: "Mobil" },
      { content: "Flutter’ın dili — temiz ve sürdürülebilir mobil kod.", category: "Dil" },
      { content: "iOS tarafında native geliştirme ve platforma özgü deneyimler.", category: "iOS" },
      { content: "Jetpack Compose ile modern, native Android arayüzleri.", category: "Android" },
      { content: "PostgreSQL, MSSQL ve MySQL — şema tasarımı, sorgu optimizasyonu ve veri modelleme.", category: "Veritabanı" },
      { content: "Dağıtım, sürüm yönetimi ve sunucu/veritabanı operasyonları.", category: "Altyapı" },
      { content: "Cihazlardan veri toplayan bağlı sistemler ve otomasyon üzerine çalışıyorum.", category: "Sistemler" },
    ],
  },
  work: {
    eyebrow: "Seçili İşler",
    title: "Yaptıklarım",
    items: [
      {
        title: "Ankara Metrosu — Stok & Parça Takibi",
        desc: "Ankara Metrosu için kapsamlı bir stok ve yedek parça takip uygulaması — envanter, hareketler ve raporlama tek yerde.",
      },
      {
        title: "Mukansoft — Kurumsal ERP",
        desc: "İşletmelere ve kişilere özel, uçtan uca ERP çözümleri; web yönetim panelleri ve mobil uygulamalarla birlikte.",
      },
      {
        title: "Mobil Uygulama Geliştirme",
        desc: "Flutter ile çoklu platform; Swift ve Kotlin (Jetpack Compose) ile native iOS ve Android uygulamaları.",
      },
      {
        title: "Web & Yönetim Panelleri",
        desc: "İş süreçlerini yöneten modern web uygulamaları ve veriyle çalışan yönetim panelleri.",
      },
    ],
  },
  experience: {
    eyebrow: "Kariyer",
    title: "Nerelerde çalıştım",
    years: ["Günümüz", "Staj", "Staj"],
    roles: ["Bilgisayar Mühendisi", "Yazılım Stajyeri", "Yazılım Stajyeri"],
    descs: [
      "Mukan Group bünyesinde; işletmelere özel ERP, web ve mobil uygulamalar geliştiriyorum. Backend, veritabanı ve dağıtım dahil uçtan uca.",
      "TCDD Teknik’te yazılım geliştirme süreçlerine katkı sağladım; kurumsal sistemlerle birebir deneyim kazandım.",
      "Bilsoft Yazılım’da staj — ticari yazılım ve veritabanı üzerine ilk profesyonel deneyimim.",
    ],
  },
  contact: {
    eyebrow: "İletişime geç",
    title1: "Hadi birlikte",
    title2pre: "bir şeyler ",
    title2ital: "üretelim.",
    resume: "Özgeçmiş",
  },
  footer: { left: "© 2026 Samet Güler — Tüm hakları saklıdır", right: "Özenle tasarlandı & geliştirildi" },
  request: {
    title: "Hizmet Talebi Oluştur",
    subtitle: "Projenizden bahsedin, birlikte hayata geçirelim.",
    name: "Ad Soyad / Firma",
    email: "E-posta Adresi",
    phone: "Telefon Numarası (İsteğe Bağlı)",
    projectType: "Proje Tipi",
    projectTypes: ["Web Uygulaması", "Mobil Uygulama", "Kurumsal ERP", "IoT / Otomasyon", "Diğer"],
    budget: "Tahmini Bütçe",
    budgets: ["Aralık seçin...", "Mikro (< 25.000 TL)", "Gelişim (25.000 TL - 100.000 TL)", "Kurumsal (100.000 TL+)", "Belirlenmedi"],
    details: "Proje Detayları & Hedefler",
    submit: "Talebi Gönder",
    submitting: "Gönderiliyor...",
    successTitle: "Talep Alındı!",
    successDesc: "Teşekkürler! En geç 24 saat içinde sizinle iletişime geçeceğim.",
    back: "Ana Sayfaya Dön",
    required: "Bu alan zorunludur",
  },
  blog: {
    title: "Blog",
    subtitle: "Yazılım mühendisliği, ERP mimarisi ve teknoloji notları.",
    readTime: "dk okuma",
    back: "Ana Sayfaya Dön",
    noPosts: "Bu dilde henüz bir yazı yayınlanmadı.",
  },
};

const dict: Record<Lang, Content> = { en, tr };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; c: Content };
const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      window.localStorage.getItem("lang")) as Lang | null;
    if (stored === "tr" || stored === "en") {
      if (stored !== lang) setLang(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    if (typeof window !== "undefined") window.localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, c: dict[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}
