"use client";

import { useEffect } from "react";

/** Locks page scroll while `locked` (compensates the scrollbar width). */
export default function useScrollLock(locked) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const previous = {
      overflow: root.style.overflow,
      paddingRight: root.style.paddingRight,
    };
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.paddingRight;
    };
  }, [locked]);
}
