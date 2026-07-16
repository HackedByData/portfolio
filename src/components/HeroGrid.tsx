"use client";

import { useEffect, useRef } from "react";

const DRIFT_PX = 8;

/**
 * Cursor-reactive blueprint grid for the hero: a dim base grid plus a
 * brighter copy masked to a spotlight around the pointer, both drifting
 * a few px toward the cursor. Writes CSS vars directly (no re-renders);
 * inert under prefers-reduced-motion and on no-hover (touch) devices,
 * where it renders the same static grid the hero had before.
 */
export default function HeroGrid() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const section = el?.parentElement;
    if (!el || !section) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = section.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.setProperty("--dx", `${(x / r.width - 0.5) * 2 * DRIFT_PX}px`);
        el.style.setProperty("--dy", `${(y / r.height - 0.5) * 2 * DRIFT_PX}px`);
        el.classList.add("is-tracking");
      });
    };
    const onLeave = () => {
      el.classList.remove("is-tracking");
      el.style.setProperty("--dx", "0px");
      el.style.setProperty("--dy", "0px");
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden className="hero-grid" />;
}
