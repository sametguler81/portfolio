import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n";

const display = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sametguler.online"),
  title: {
    default: "Samet Güler — Bilgisayar Mühendisi | Computer Engineer",
    template: "%s | Samet Güler",
  },
  description:
    "Full-stack bilgisayar mühendisi. Kurumsal ERP çözümleri, web ve mobil uygulamalar, veritabanı modelleme ve IoT sistemleri geliştiriyorum. / Full-stack computer engineer crafting custom ERP, web, mobile and IoT solutions.",
  keywords: [
    "Samet Güler",
    "Samet Guler",
    "Bilgisayar Mühendisi",
    "Computer Engineer",
    "Software Developer",
    "Yazılım Geliştirici",
    "ERP Çözümleri",
    "ERP Solutions",
    "Next.js Portfolio",
    "Flutter Geliştirici",
    "React Developer",
    "IoT Sistemleri",
    "Full-stack Engineer",
    "Yazılım Mühendisi Turkey",
  ],
  authors: [{ name: "Samet Güler" }],
  creator: "Samet Güler",
  publisher: "Samet Güler",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Samet Güler — Bilgisayar Mühendisi | Computer Engineer",
    description:
      "Kurumsal ERP çözümleri, web/mobil uygulamalar ve IoT sistemleri geliştiriyorum. Projelerimi inceleyin ve hizmet talebinde bulunun.",
    url: "https://sametguler.online",
    siteName: "Samet Güler Portfolio",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Samet Güler Logo",
      },
    ],
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary",
    title: "Samet Güler — Bilgisayar Mühendisi | Computer Engineer",
    description:
      "Full-stack bilgisayar mühendisi. Kurumsal ERP çözümleri, web/mobil uygulamalar ve IoT otomasyonu.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
