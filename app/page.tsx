"use client";

import { useEffect, useState } from "react";
import {
  ScrollProgress,
  Reveal,
  RiseLine,
  Counter,
  Parallax,
} from "@/components/motion";
import ScrollHero from "@/components/scroll-hero";
import SkillsOrbit from "@/components/skills-orbit";
import { useT, type Lang } from "@/components/i18n";
import { HeroParallaxDemo } from "@/components/ui/hero-parallax-demo";
import NavHeader from "@/components/ui/nav-header";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Link from "next/link";

const experienceMeta = [
  { co: "Mukansoft · Mukan Group" },
  { co: "TCDD Teknik" },
  { co: "Bilsoft Yazılım" },
];

const stats = [
  { to: 4, suffix: "+" },
  { to: 12, suffix: "+" },
  { to: 3, suffix: "" },
];

const marqueeWords = [
  "Web Engineering",
  "Mobile Solutions",
  "Enterprise ERP",
  "Scalable Backend",
  "Data Architecture",
  "Cloud DevOps",
  "IoT Systems"
];

function LangSwitch() {
  const { lang, setLang } = useT();
  const opt = (l: Lang, label: string) => (
    <button
      type="button"
      className={`lang-btn ${lang === l ? "is-active" : ""}`}
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
    >
      {label}
    </button>
  );
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {opt("en", "EN")}
      <span className="lang-sep">/</span>
      {opt("tr", "TR")}
    </div>
  );
}

export default function Home() {
  const { c, lang } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(atob("c2FtZXRndWxlcjgxQHlhaG9vLmNvbS50cg=="));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY > window.innerHeight * 0.9);

      const sections = ["about", "skills", "work", "experience", "contact"];
      let currentActive = "";

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            currentActive = section;
            break;
          }
        }
      }
      if (currentActive) {
        setActiveSection(currentActive);
      } else {
        setActiveSection("");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <ScrollProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Samet Güler",
            "jobTitle": "Computer Engineer / Bilgisayar Mühendisi",
            "url": "https://sametguler.online",
            "sameAs": [
              "https://github.com/sametguler81",
              "https://www.linkedin.com/in/samet-g%C3%BCler-211559219"
            ],
            "knowsAbout": [
              "Computer Engineering",
              "Software Development",
              "ERP Solutions",
              "Web Development",
              "Mobile Application Development",
              "IoT Systems",
              "PostgreSQL",
              "Flutter",
              "React",
              "Next.js"
            ],
            "worksFor": {
              "@type": "Organization",
              "name": "Mukansoft"
            }
          })
        }}
      />

      {/* NAV */}
      <nav className="nav">
        <a href="#top" className="nav-logo serif">
          Samet Güler<span style={{ color: "var(--accent-deep)" }}></span>
        </a>
        <div className="nav-right">
          <div className="nav-menu">
            <NavHeader activeSection={activeSection} />
          </div>
          <div className="nav-lang-desktop">
            <LangSwitch />
          </div>
          <button
            className={`nav-toggle ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mobile-overlay"
          >
            <div className="mobile-overlay-content">
              <ul className="mobile-nav-links">
                <li>
                  <a
                    href="#about"
                    onClick={() => setMenuOpen(false)}
                    className={activeSection === "about" ? "is-active" : ""}
                  >
                    {c.nav.about}
                  </a>
                </li>
                <li>
                  <a
                    href="#skills"
                    onClick={() => setMenuOpen(false)}
                    className={activeSection === "skills" ? "is-active" : ""}
                  >
                    {c.nav.skills}
                  </a>
                </li>
                <li>
                  <a
                    href="#work"
                    onClick={() => setMenuOpen(false)}
                    className={activeSection === "work" ? "is-active" : ""}
                  >
                    {c.nav.work}
                  </a>
                </li>
                <li>
                  <a
                    href="#experience"
                    onClick={() => setMenuOpen(false)}
                    className={activeSection === "experience" ? "is-active" : ""}
                  >
                    {c.nav.experience}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={() => setMenuOpen(false)}
                    className={activeSection === "contact" ? "is-active" : ""}
                  >
                    {c.nav.contact}
                  </a>
                </li>
                <li>
                  <Link
                    href="/blog"
                    onClick={() => setMenuOpen(false)}
                  >
                    {c.nav.blog}
                  </Link>
                </li>
              </ul>
              <div className="mobile-overlay-footer">
                <LangSwitch />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* HERO — cinematic scroll sequence */}
      <ScrollHero />

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} style={{ display: "inline-flex", gap: 48 }}>
              {marqueeWords.map((w) => (
                <span key={w} style={{ display: "inline-flex", gap: 48 }}>
                  {w} <span className="dot">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="section-pad">
        <div className="wrap">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">{c.about.eyebrow}</span>
            </Reveal>
          </div>

          <div className="about-grid">
            <div>
              <Reveal>
                <p className="about-lead serif">
                  {c.about.leadPre}
                  <em>{c.about.leadEm}</em>
                  {c.about.leadPost}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="about-body">{c.about.body}</p>
              </Reveal>
            </div>

            <Parallax amount={40} className="stats">
              {stats.map((s, i) => (
                <Reveal key={i} delay={i * 0.1} className="stat">
                  <div className="stat-num serif">
                    <Counter to={s.to} suffix={s.suffix} />
                  </div>
                  <div className="stat-label">{c.about.statLabels[i]}</div>
                </Reveal>
              ))}
            </Parallax>
          </div>
        </div>
      </section>

      {/* SKILLS — radial orbital */}
      <section id="skills" className="section-pad skills-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Reveal>
                <span className="eyebrow">{c.skills.eyebrow}</span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="serif">{c.skills.title}</h2>
              </Reveal>
            </div>
          </div>
          <Reveal>
            <p className="skills-hint mono">{c.skills.hint}</p>
          </Reveal>
        </div>
        <SkillsOrbit />
      </section>

      {/* WORK — Aceternity Parallax Showcase */}
      <section id="work">
        <HeroParallaxDemo />
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="section-pad">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Reveal>
                <span className="eyebrow">{c.experience.eyebrow}</span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="serif">{c.experience.title}</h2>
              </Reveal>
            </div>
          </div>

          <div className="timeline">
            {experienceMeta.map((e, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="tl-item">
                  <div className="tl-year mono">{c.experience.years[i]}</div>
                  <div>
                    <h3 className="tl-role serif">{c.experience.roles[i]}</h3>
                    <div className="tl-co">{e.co}</div>
                    <p className="tl-desc">{c.experience.descs[i]}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact">
        <div className="hero-glow" style={{ left: "-10%", right: "auto" }} />
        <div className="wrap">
          <Reveal>
            <span className="eyebrow" style={{ marginBottom: 32 }}>
              {c.contact.eyebrow}
            </span>
          </Reveal>
          <h2 className="serif" style={{ marginTop: 24 }}>
            <RiseLine>{c.contact.title1}</RiseLine>
            <RiseLine delay={0.1}>
              {c.contact.title2pre}
              <span className="ital">{c.contact.title2ital}</span>
            </RiseLine>
          </h2>
          <Reveal delay={0.3}>
            <a className="contact-mail" href={email ? `mailto:${email}` : "#"}>
              {email || "sametguler81 [at] yahoo.com.tr"}
            </a>
          </Reveal>
          <Reveal delay={0.4}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              <div className="socials">
                <a href="https://github.com/sametguler81" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/samet-g%C3%BCler-211559219" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
              <Link href="/request" className="btn-request">
                {lang === "tr" ? "Teklif Al" : "Request Service"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div
          className="wrap"
          style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, width: "100%" }}
        >
          <span>{c.footer.left}</span>
        </div>
      </footer>

      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fab-up"
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
