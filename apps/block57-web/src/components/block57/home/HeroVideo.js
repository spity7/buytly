"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroVideo.module.scss";

/**
 * Muted, looping background film for the hero (decorative). Starts paused for
 * visitors who prefer reduced motion and always offers a pause/play control
 * (WCAG 2.2.2). The poster holds the frame before playback, so there is no
 * layout shift.
 */
export default function HeroVideo({ src, poster, type = "video/mp4" }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    video.play().then(
      () => setPlaying(true),
      () => setPlaying(false), // autoplay blocked: the poster stays
    );
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <video
        ref={ref}
        className={styles.video}
        poster={poster || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={src} type={type} />
      </video>
      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        aria-label={
          playing ? "Pause background video" : "Play background video"
        }
      >
        <span
          aria-hidden="true"
          className={playing ? styles.pause : styles.play}
        />
      </button>
    </>
  );
}
