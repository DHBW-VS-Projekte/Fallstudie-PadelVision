"use client";

import { useEffect } from "react";

export default function PadelEntryScroll() {
  useEffect(() => {
    let shouldScroll = false;
    try {
      shouldScroll = sessionStorage.getItem("padel-entry-scroll") === "1";
    } catch {
      return;
    }
    if (!shouldScroll) return;

    let frame = 0;
    const scroll = () => {
      try {
        sessionStorage.removeItem("padel-entry-scroll");
      } catch {
        return;
      }
      const target = 88;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }

      const start = window.scrollY;
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 420, 1);
        const eased = 1 - (1 - progress) ** 3;
        window.scrollTo({ top: start + (target - start) * eased, behavior: "instant" });
        if (progress < 1) frame = window.requestAnimationFrame(animate);
      };
      frame = window.requestAnimationFrame(animate);
    };
    const timer = window.setTimeout(scroll, 120);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}