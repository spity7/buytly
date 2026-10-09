"use client";

import { useEffect, useRef } from "react";
import ImageTile from "@/components/block57/ui/ImageTile";
import LightboxGallery from "@/components/block57/ui/LightboxGallery";
import styles from "./HomeMarquee.module.scss";

/** Live Swiper speed: one slide every 4s (≈195 px/s desktop, 101 px/s phones). */
const SECONDS_PER_SLIDE = 4;
const DRAG_THRESHOLD = 5;

const mod = (value, length) => ((value % length) + length) % length;

/**
 * Ticker engine. Every slide sits at `p_i - offset`, wrapped into
 * [-lead, total - lead): the 13 slides are longer than any viewport plus one
 * slide, so the strip loops without cloned slides (one lightbox item per
 * image, one tab stop per image).
 */
function startTicker({ viewport, track, slides }) {
  let positions = [];
  let widths = [];
  let total = 0;
  let lead = 0;
  let speed = 0;
  let offset = 0;
  let frame = 0;
  let last = 0;
  let visible = true;
  const pause = { hover: false, focus: false, drag: false };

  function measure() {
    const gap = parseFloat(getComputedStyle(track).getPropertyValue("--_gap"));
    const previous = total;
    widths = slides.map((slide) => slide.offsetWidth + gap);
    positions = [];
    total = 0;
    for (const width of widths) {
      positions.push(total);
      total += width;
    }
    lead = track.offsetLeft + Math.max(...widths);
    speed = total / slides.length / SECONDS_PER_SLIDE;
    if (previous) offset = (offset / previous) * total;
  }

  function place() {
    slides.forEach((slide, index) => {
      const x = mod(positions[index] - offset + lead, total) - lead;
      slide.style.transform = `translate3d(${x}px, 0, 0)`;
    });
  }

  function tick(now) {
    const seconds = Math.min((now - last) / 1000, 0.1); // no jump after a hidden tab
    last = now;
    if (!pause.hover && !pause.focus && !pause.drag) {
      offset = mod(offset + speed * seconds, total);
      place();
    }
    frame = requestAnimationFrame(tick);
  }

  function run() {
    cancelAnimationFrame(frame);
    if (!visible) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  // ---- Pause on mouse hover and keyboard focus ------------------------------
  const onPointerEnter = (event) => {
    if (event.pointerType === "mouse") pause.hover = true;
  };
  const onPointerLeave = () => {
    pause.hover = false;
  };
  const onFocusIn = (event) => {
    pause.focus = true;
    const index = slides.findIndex((slide) => slide.contains(event.target));
    if (index === -1) return;
    // Bring a focused slide that is (partly) off screen to the start.
    const x = mod(positions[index] - offset + lead, total) - lead;
    const left = -track.offsetLeft;
    const right = viewport.clientWidth - track.offsetLeft;
    if (x < left || x + widths[index] > right) {
      offset = mod(positions[index], total);
      place();
    }
  };
  const onFocusOut = (event) => {
    if (!track.contains(event.relatedTarget)) pause.focus = false;
  };

  // ---- Drag (touch, pen and mouse), as on live ----------------------------------
  let drag = null;
  let suppressClick = false;
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    drag = { x: event.clientX, offset, id: event.pointerId, moved: false };
  };
  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!drag.moved) {
      drag.moved = true;
      pause.drag = true;
      track.setPointerCapture?.(event.pointerId);
    }
    offset = mod(drag.offset - dx, total);
    place();
  };
  const onPointerUp = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    suppressClick = drag.moved;
    drag = null;
    pause.drag = false;
  };
  // A drag that ends on a tile must not open the lightbox.
  const onClickCapture = (event) => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  };
  const onDragStart = (event) => event.preventDefault();
  // Browsers without `overflow: clip` scroll a hidden box to show a focused
  // tile: undo it (the focus handler already moved the tile into view).
  const onScroll = () => {
    viewport.scrollLeft = 0;
  };

  const listeners = [
    ["pointerenter", onPointerEnter],
    ["pointerleave", onPointerLeave],
    ["focusin", onFocusIn],
    ["focusout", onFocusOut],
    ["pointerdown", onPointerDown],
    ["pointermove", onPointerMove],
    ["pointerup", onPointerUp],
    ["pointercancel", onPointerUp],
    ["dragstart", onDragStart],
  ];
  listeners.forEach(([type, handler]) => track.addEventListener(type, handler));
  track.addEventListener("click", onClickCapture, true);
  viewport.addEventListener("scroll", onScroll);

  const resizeObserver = new ResizeObserver(() => {
    measure();
    place();
  });
  resizeObserver.observe(viewport);

  // Stop the loop while the strip is off screen.
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    run();
  });
  intersectionObserver.observe(viewport);

  viewport.dataset.mode = "ticker";
  measure();
  place();
  run();

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    listeners.forEach(([type, handler]) =>
      track.removeEventListener(type, handler),
    );
    track.removeEventListener("click", onClickCapture, true);
    viewport.removeEventListener("scroll", onScroll);
    slides.forEach((slide) => {
      slide.style.transform = "";
    });
    delete viewport.dataset.mode;
  };
}

/**
 * Home image ticker (live Swiper: linear, continuous, loop, drag, no arrows or
 * dots): images 500px tall at their own width (one 100%-wide slide per view
 * ≤767px), each a lightbox tile. Pauses on mouse hover and keyboard focus.
 *
 * Without JavaScript or under prefers-reduced-motion it does not move: the
 * strip scrolls horizontally instead.
 *
 * @param {{ label: string, slides: Array<import("@/lib/block57/assets").Block57Asset> }} props
 */
export default function MarqueeTicker({ label, slides }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = null;
    const sync = () => {
      stop?.();
      stop = reduce.matches
        ? null
        : startTicker({ viewport, track, slides: [...track.children] });
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      stop?.();
    };
  }, []);

  return (
    <section className={styles.marquee} aria-label={label}>
      <div ref={viewportRef} className={styles.viewport}>
        <LightboxGallery>
          <ul ref={trackRef} className={styles.track}>
            {slides.map((image) => {
              const ratio = image.width / image.height;
              return (
                <li
                  key={image.id}
                  className={styles.slide}
                  style={{ "--_ratio": ratio }}
                >
                  <ImageTile
                    image={image}
                    sizes={`(max-width: 767px) 100vw, ${Math.round(500 * ratio)}px`}
                  />
                </li>
              );
            })}
          </ul>
        </LightboxGallery>
      </div>
    </section>
  );
}
