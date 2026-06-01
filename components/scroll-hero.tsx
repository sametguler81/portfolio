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

const IMAGE_FRAME_COUNT = 240;
const LOOKAHEAD = 28; // frames to keep decoded ahead of the playhead
const BEHIND = 10; // frames to keep decoded behind
const LERP = 0.18; // playhead smoothing toward scroll target
const AUTO_ADVANCE_DELAY = 2400;
const AUTO_SCROLL_SPEED = 240;

function frameSrc(frame: number) {
  return `/video/frame_${String(frame).padStart(4, "0")}.jpg`;
}

export default function ScrollHero() {
  const { c } = useT();
  const FRAMES = c.hero.frames;
  const N = FRAMES.length;
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pro image-sequence engine: off-thread decode (createImageBitmap) +
  // a sliding window of decoded bitmaps (close() the rest) + rAF lerp loop.
  const bitmaps = useRef<Map<number, ImageBitmap>>(new Map());
  const loading = useRef<Set<number>>(new Set());
  const targetFrameRef = useRef(1);
  const displayFrameRef = useRef(1);
  const lastDrawnRef = useRef(-1);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let disposed = false;

    const loadFrame = (i: number) => {
      if (i < 1 || i > IMAGE_FRAME_COUNT) return;
      if (bitmaps.current.has(i) || loading.current.has(i)) return;
      loading.current.add(i);
      fetch(frameSrc(i))
        .then((r) => r.blob())
        .then((b) => createImageBitmap(b))
        .then((bmp) => {
          loading.current.delete(i);
          if (disposed) {
            bmp.close();
            return;
          }
          bitmaps.current.set(i, bmp);
          ensureLoop(); // a newly-ready frame may need to be drawn
        })
        .catch(() => loading.current.delete(i));
    };

    // Keep only frames near the playhead decoded; free the rest.
    const ensureWindow = (center: number) => {
      for (let i = center - BEHIND; i <= center + LOOKAHEAD; i++) loadFrame(i);
      const lo = center - BEHIND - 6;
      const hi = center + LOOKAHEAD + 6;
      for (const [key, bmp] of bitmaps.current) {
        if (key < lo || key > hi) {
          bmp.close();
          bitmaps.current.delete(key);
        }
      }
    };

    const nearestLoaded = (i: number): ImageBitmap | null => {
      if (bitmaps.current.has(i)) return bitmaps.current.get(i)!;
      for (let d = 1; d <= 16; d++) {
        if (bitmaps.current.has(i - d)) return bitmaps.current.get(i - d)!;
        if (bitmaps.current.has(i + d)) return bitmaps.current.get(i + d)!;
      }
      return null;
    };

    const draw = (frameIdx: number) => {
      const bmp = nearestLoaded(frameIdx);
      if (!bmp) return false;

      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const ir = bmp.width / bmp.height;
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
      ctx.drawImage(bmp, ox, oy, dw, dh);
      return true;
    };

    const tick = () => {
      rafRef.current = 0;
      const target = targetFrameRef.current;
      let display = displayFrameRef.current;
      display += (target - display) * LERP;
      if (Math.abs(target - display) < 0.01) display = target;
      displayFrameRef.current = display;

      const frameIdx = Math.min(IMAGE_FRAME_COUNT, Math.max(1, Math.round(display)));
      ensureWindow(frameIdx);

      if (frameIdx !== lastDrawnRef.current) {
        if (draw(frameIdx)) lastDrawnRef.current = frameIdx;
      }

      // keep looping while still easing toward target
      if (Math.abs(target - display) >= 0.01) ensureLoop();
    };

    const ensureLoop = () => {
      if (rafRef.current || disposed) return;
      rafRef.current = requestAnimationFrame(tick);
    };

    // expose for scroll handler + resize via refs on the canvas element
    (canvas as any).__ensureLoop = ensureLoop;

    // initial: load the opening window and paint frame 1 once ready
    ensureWindow(1);
    ensureLoop();

    const onResize = () => {
      lastDrawnRef.current = -1; // force redraw at new size
      ensureLoop();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      for (const bmp of bitmaps.current.values()) bmp.close();
      bitmaps.current.clear();
      loading.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    targetFrameRef.current = 1 + v * (IMAGE_FRAME_COUNT - 1);
    const cv = canvasRef.current as any;
    if (cv && cv.__ensureLoop) cv.__ensureLoop();
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
