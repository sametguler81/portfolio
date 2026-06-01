"use client";
import React from "react";
import { HeroParallax } from "./hero-parallax";

export function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}

export const products = [
  // 1. Ankara Metrosu — Metro/Train tracks
  {
    title: "Ankara Metrosu — Stok & Parça Takibi",
    link: "#contact",
    thumbnail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=600&auto=format&fit=crop",
  },
  // 2. TCDD Teknik — Railway cables & high-speed train engineering
  {
    title: "TCDD Teknik — Kurumsal Sistemler",
    link: "#contact",
    thumbnail: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop",
  },
  // 3. Bilsoft Yazılım — Commercial database & charts
  {
    title: "Bilsoft Yazılım — Veritabanı Temelleri",
    link: "#contact",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
  },

  // 4. Flutter Mobile Engineering — Wireframe and devices
  {
    title: "Flutter Mobile Engineering",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop",
  },
  // 5. Node.js System Architectures — Coding lines
  {
    title: "Node.js System Architectures",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
  },
  // 6. React Web Applications — React atom
  {
    title: "React Web Applications",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
  },
  // 7. Swift iOS Native Development — MacOS SwiftUI mockup
  {
    title: "Swift iOS Native Development",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&auto=format&fit=crop",
  },
  // 8. Kotlin Android Architecture — Android code editor
  {
    title: "Kotlin Android Architecture",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600&auto=format&fit=crop",
  },
  // 9. PostgreSQL Database Tuning — Database / data indexes
  {
    title: "PostgreSQL Database Tuning",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600&auto=format&fit=crop",
  },
  // 10. DevOps & Deployment Pipelines — Rack server cluster
  {
    title: "DevOps & Deployment Pipelines",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=600&auto=format&fit=crop",
  },
  // 11. Internet of Things & Automation — Hardware circuit board
  {
    title: "Internet of Things & Automation",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
  },
  // 12. Relational Database Modeling — Server file indexes
  {
    title: "Relational Database Modeling",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop",
  },
  // 13. API Engineering & Integration — Code API interfaces
  {
    title: "API Engineering & Integration",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
  },
  // 14. Enterprise ERP Solutions — Business ERP analytics
  {
    title: "Enterprise ERP Solutions",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
  },
  // 15. Cross-Platform Frameworks — Responsive designer workspace
  {
    title: "Cross-Platform Frameworks",
    link: "#skills",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop",
  },
];
