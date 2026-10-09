"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.scss";

/**
 * Live "opal" entrance animations, played once when the element scrolls into
 * view: effect "up" (translateY 100px → 0), "left" (enters from the right,
 * translateX 100px → 0), "right" (enters from the left, −100px → 0) or
 * "helix" (rotateY −180° → 0), all with a fade, `ease`, 0.75s (`fast`,
 * default) or 1.25s (`fast={false}`), after `delay` ms.
 *
 * Content is visible in the server HTML (no-JS safe); after hydration only
 * elements still below the fold are hidden, then animated in. Nothing moves
 * under prefers-reduced-motion.
 *
 * @param {{ as?: string, effect?: "up"|"left"|"right"|"helix",
 *   delay?: number, fast?: boolean, className?: string }} props
 */
export default function Reveal({
  as: Tag = "div",
  effect = "up",
  delay = 0,
  fast = true,
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

    if (node.getBoundingClientRect().top < window.innerHeight) {
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
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, styles[effect], className]
        .filter(Boolean)
        .join(" ")}
      data-phase={phase}
      style={{
        ...style,
        ...(delay ? { "--_delay": `${delay}ms` } : null),
        ...(fast ? null : { "--_duration": "var(--b57-duration-entrance)" }),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
