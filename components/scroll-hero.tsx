"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/i18n";

const AUTO_ADVANCE_DELAY = 2400;
const AUTO_SCROLL_SPEED = 240; // scroll px/sec when auto-advancing

export default function ScrollHero() {
  const { c } = useT();
  const FRAMES = c.hero.frames;
  const N = FRAMES.length;
  const ref = useRef<HTMLElement>(null);

  // Scroll-scrubbed <video> — one hardware-decoded file, no per-frame JS work.
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const targetTimeRef = useRef(0);
  const seekRafRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.0005,
  });

  const [sceneIndex, setSceneIndex] = useState(0);

  // Move the video playhead toward the scroll target, coalesced to one seek/frame.
  const scheduleSeek = () => {
    if (seekRafRef.current) return;
    seekRafRef.current = requestAnimationFrame(() => {
      seekRafRef.current = 0;
      const v = videoRef.current;
      const d = durationRef.current;
      if (!v || !d) return;
      const t = Math.min(d - 0.05, Math.max(0, targetTimeRef.current));
      if (Math.abs(v.currentTime - t) > 0.012) {
        try {
          v.currentTime = t;
        } catch {
          /* seek not ready yet */
        }
      }
    });
  };

  // Prime the video: load metadata, get duration, unlock seeking (esp. iOS).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onMeta = () => {
      durationRef.current = v.duration || 0;
      // Muted + playsInline autoplay is allowed; play/pause primes seeking.
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(() => v.pause()).catch(() => {});
      }
      try {
        v.currentTime = 0.0001;
      } catch {
        /* noop */
      }
    };

    v.addEventListener("loadedmetadata", onMeta);
    if (v.readyState >= 1) onMeta();
    return () => v.removeEventListener("loadedmetadata", onMeta);
  }, []);

  // Auto-advance: gently scroll the pinned hero when the user is idle.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let frameId = 0;
    let resumeTimer = 0;
    let lastTime: number | null = null;
    let isRunning = false;

    const getHeroScrollRange = () => {
      const el = ref.current;
      if (!el) return null;
      const top = window.scrollY + el.getBoundingClientRect().top;
      const end = top + el.offsetHeight - window.innerHeight;
      return { top, end };
    };

    const stopAutoAdvance = () => {
      isRunning = false;
      lastTime = null;
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const goToAbout = () => {
      const aboutEl = document.getElementById("about");
      if (aboutEl) aboutEl.scrollIntoView({ behavior: "smooth" });
    };

    const step = (time: number) => {
      if (!isRunning) return;
      const range = getHeroScrollRange();
      if (!range) {
        stopAutoAdvance();
        return;
      }
      const currentY = window.scrollY;
      if (currentY < range.top - 1 || currentY >= range.end - 1) {
        if (currentY >= range.end - 1) goToAbout();
        stopAutoAdvance();
        return;
      }
      if (lastTime !== null) {
        const distance = ((time - lastTime) / 1000) * AUTO_SCROLL_SPEED;
        const nextY = Math.min(range.end, currentY + distance);
        window.scrollTo({ top: nextY, behavior: "instant" });
        if (nextY >= range.end - 1) {
          stopAutoAdvance();
          setTimeout(goToAbout, 50);
          return;
        }
      }
      lastTime = time;
      frameId = window.requestAnimationFrame(step);
    };

    const startAutoAdvance = () => {
      if (isRunning) return;
      const range = getHeroScrollRange();
      if (!range) return;
      const currentY = window.scrollY;
      if (currentY < range.top - 1 || currentY >= range.end - 1) return;
      isRunning = true;
      lastTime = null;
      frameId = window.requestAnimationFrame(step);
    };

    const scheduleAutoAdvance = () => {
      stopAutoAdvance();
      if (resumeTimer) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(startAutoAdvance, AUTO_ADVANCE_DELAY);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopAutoAdvance();
        if (resumeTimer) window.clearTimeout(resumeTimer);
      } else {
        scheduleAutoAdvance();
      }
    };

    window.addEventListener("wheel", scheduleAutoAdvance, { passive: true });
    window.addEventListener("touchstart", scheduleAutoAdvance, { passive: true });
    window.addEventListener("pointerdown", scheduleAutoAdvance);
    window.addEventListener("keydown", scheduleAutoAdvance);
    window.addEventListener("resize", scheduleAutoAdvance);
    document.addEventListener("visibilitychange", handleVisibility);

    scheduleAutoAdvance();

    return () => {
      stopAutoAdvance();
      if (resumeTimer) window.clearTimeout(resumeTimer);
      window.removeEventListener("wheel", scheduleAutoAdvance);
      window.removeEventListener("touchstart", scheduleAutoAdvance);
      window.removeEventListener("pointerdown", scheduleAutoAdvance);
      window.removeEventListener("keydown", scheduleAutoAdvance);
      window.removeEventListener("resize", scheduleAutoAdvance);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const nextScene = Math.min(N - 1, Math.max(0, Math.round(v * (N - 1))));
    setSceneIndex((current) => (current === nextScene ? current : nextScene));

    if (durationRef.current) {
      targetTimeRef.current = v * durationRef.current;
      scheduleSeek();
    }
  });

  const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.13]);
  const imageX = useTransform(scrollYProgress, [0, 1], ["-1.5%", "1.5%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-1%", "1%"]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["18%", "82%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["28%", "68%"]);

  const active = FRAMES[sceneIndex];

  return (
    <section className="scroll-hero" ref={ref} id="top">
      <div className="sh-stage">
        <motion.div className="sh-bg" style={{ scale: imageScale, x: imageX, y: imageY }}>
          <video
            ref={videoRef}
            className="sh-frame"
            muted
            playsInline
            preload="auto"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <motion.div
          className="sh-glow"
          style={{ left: glowX, top: glowY }}
          aria-hidden="true"
        />
        <div className="sh-vignette" />

        {/* top meta row */}
        <div className="sh-top wrap">
          <span>{c.hero.meta[0]}</span>
          {c.hero.meta[1] && <span className="sh-top-mid">{c.hero.meta[1]}</span>}
          {c.hero.meta[2] && <span>{c.hero.meta[2]}</span>}
        </div>

        {/* center caption — crossfades per scene */}
        <div className="sh-center wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${sceneIndex}-${active.word}`}
              exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } }}
              className="sh-caption"
            >
              <motion.span
                className="sh-kicker mono"
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                style={{ display: "inline-block" }}
              >
                {active.kicker}
              </motion.span>

              <h1 className="serif" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  style={{ display: "inline-block" }}
                >
                  {active.word}
                </motion.span>

                <motion.span
                  className="sh-line"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                  style={{ display: "inline-block" }}
                >
                  {active.line}
                </motion.span>
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* bottom bar: progress + hint */}
        <div className="sh-bottom wrap">
          <div className="sh-progress">
            <motion.div className="sh-progress-fill" style={{ width: barWidth }} />
          </div>
          <div className="sh-hint mono">
            <span className="sh-hint-dot" />
            {c.hero.hint}
          </div>
        </div>
      </div>
    </section>
  );
}
