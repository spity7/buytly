"use client";

import { useEffect, useRef, useState } from "react";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import styles from "./Odometer.module.scss";

/**
 * Live "odometer" counter: each digit rolls up from 0 to its value (2s) the
 * first time the number scrolls into view. Leading digits start blank, so it
 * opens on a single "0" as on live.
 *
 * The final value is in the server HTML: without JavaScript (CSS
 * `scripting: none`) and under prefers-reduced-motion it shows at once. Screen
 * readers get the plain number; the rolling digits are hidden from them.
 *
 * @param {{ value: number, className?: string }} props
 */
export default function Odometer({ value, className }) {
  const ref = useRef(null);
  const [rolled, setRolled] = useState(false);
  const digits = String(value).split("").map(Number);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!("IntersectionObserver" in window)) {
      setRolled(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setRolled(true);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={[styles.odometer, className].filter(Boolean).join(" ")}
      data-rolled={rolled ? "" : undefined}
    >
      <VisuallyHidden>{value}</VisuallyHidden>
      <span className={styles.digits} aria-hidden="true">
        {digits.map((digit, position) => {
          const leading = position < digits.length - 1;
          return (
            <span key={position} className={styles.column}>
              <span className={styles.strip} style={{ "--_digit": digit }}>
                {Array.from({ length: digit + 1 }, (_, cell) => (
                  <span key={cell} className={styles.cell}>
                    {leading && cell === 0 ? "" : cell}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
