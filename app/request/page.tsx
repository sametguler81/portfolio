import type { Metadata } from "next";
import RequestForm from "@/components/request-form";

export const metadata: Metadata = {
  title: "Hizmet Talebi Oluştur — Samet Güler | Bilgisayar Mühendisi",
  description:
    "Web, mobil, kurumsal ERP ve IoT projeleriniz için hizmet talebinde bulunun. Detayları ve bütçe tahmininizi paylaşarak teklif alın.",
  keywords: [
    "Hizmet Talebi",
    "İletişim",
    "Teklif Al",
    "Samet Güler",
    "Bilgisayar Mühendisi",
    "Yazılım Teklifi",
    "ERP Teklif",
    "Mobil Uygulama Teklif",
  ],
  openGraph: {
    title: "Hizmet Talebi Oluştur — Samet Güler",
    description:
      "Web, mobil, kurumsal ERP ve IoT projeleriniz için hizmet talebinde bulunun. Detayları ve bütçe tahmininizi paylaşarak teklif alın.",
    type: "website",
  },
};

export default function RequestPage() {
  return <RequestForm />;
}
