"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.scss";

/**
 * Restrained fade-up on scroll. Content is visible in the server HTML (no-JS
 * safe); after hydration only elements still below the fold are hidden and then
 * revealed when they enter the viewport. Disabled under prefers-reduced-motion.
 *
 * @param {{ as?: string, delay?: number, className?: string }} props
 *   `delay` in ms (stagger siblings with 0, 80, 160 …).
 */
export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  // "static": as rendered on the server · "hidden": waiting below the fold · "shown"
  const [phase, setPhase] = useState("static");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return undefined;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      return undefined; // already on screen: leave it alone (no flash)
    }

    setPhase("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPhase("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, className].filter(Boolean).join(" ")}
      data-phase={phase}
      style={delay ? { ...style, "--b57-reveal-delay": `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
