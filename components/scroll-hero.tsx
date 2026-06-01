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

const LERP = 0.16; // playhead smoothing toward scroll target
const AUTO_ADVANCE_DELAY = 2400;
const AUTO_SCROLL_SPEED = 240;

export default function ScrollHero() {
  const { c } = useT();
  const FRAMES = c.hero.frames;
  const N = FRAMES.length;
  const ref = useRef<HTMLElement>(null);

  // Hardware-decoded <video> scrubbed by scroll and painted to <canvas>
  // (the technique smooth-scrolling sites use — GPU decode, light on Safari/mobile).
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const durationRef = useRef(0);
  const targetRef = useRef(0);
  const dispRef = useRef(0);
  const rafRef = useRef(0);

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

  useEffect(() => {
    const v = videoRef.current;
    const cv = canvasRef.current;
    if (!v || !cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const drawVideo = () => {
      if (!v || !cv || v.readyState < 2) return;
      const cw = cv.offsetWidth;
      const ch = cv.offsetHeight;
      if (cv.width !== cw || cv.height !== ch) {
        cv.width = cw;
        cv.height = ch;
      }
      const vw = v.videoWidth || 1920;
      const vh = v.videoHeight || 1080;
      const ir = vw / vh;
      const cr = cw / ch;
      let dw = cw,
        dh = ch,
        ox = 0,
        oy = 0;
      if (ir > cr) {
        dw = ch * ir;
        ox = (cw - dw) / 2;
      } else {
        dh = cw / ir;
        oy = (ch - dh) / 2;
      }
      ctx.drawImage(v, ox, oy, dw, dh);
    };

    const ensureLoop = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    };

    function loop() {
      rafRef.current = 0;
      const d = durationRef.current;
      if (!v || !d) return;
      let disp = dispRef.current;
      disp += (targetRef.current - disp) * LERP;
      if (Math.abs(targetRef.current - disp) < 0.004) disp = targetRef.current;
      dispRef.current = disp;
      const t = Math.min(d - 0.04, Math.max(0, disp));
      if (Math.abs(v.currentTime - t) > 0.005) {
        try {
          v.currentTime = t;
        } catch {
          /* not seekable yet */
        }
      }
      drawVideo();
      if (Math.abs(targetRef.current - dispRef.current) >= 0.004) ensureLoop();
    }

    // expose so the scroll handler can wake the loop
    (cv as unknown as { __wake?: () => void }).__wake = ensureLoop;

    const onReady = () => {
      durationRef.current = v.duration || 0;
      // muted + playsInline autoplay is allowed; play/pause primes seeking + decode
      const p = v.play();
      if (p && typeof p.then === "function") p.then(() => v.pause()).catch(() => {});
      drawVideo();
      ensureLoop();
    };

    v.addEventListener("loadedmetadata", onReady);
    v.addEventListener("loadeddata", drawVideo);
    v.addEventListener("seeked", drawVideo);
    window.addEventListener("resize", drawVideo);
    if (v.readyState >= 1) onReady();

    return () => {
      v.removeEventListener("loadedmetadata", onReady);
      v.removeEventListener("loadeddata", drawVideo);
      v.removeEventListener("seeked", drawVideo);
      window.removeEventListener("resize", drawVideo);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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
      targetRef.current = v * durationRef.current;
      const cv = canvasRef.current as unknown as { __wake?: () => void } | null;
      cv?.__wake?.();
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
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <canvas
            ref={canvasRef}
            className="sh-frame"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </motion.div>
        <motion.div
          className="sh-glow"
          style={{ left: glowX, top: glowY }}
          aria-hidden="true"
        />
        <div className="sh-vignette" />

        <div className="sh-top wrap">
          <span>{c.hero.meta[0]}</span>
          {c.hero.meta[1] && <span className="sh-top-mid">{c.hero.meta[1]}</span>}
          {c.hero.meta[2] && <span>{c.hero.meta[2]}</span>}
        </div>

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
