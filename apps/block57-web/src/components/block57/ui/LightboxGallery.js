"use client";

import { Gallery } from "react-photoswipe-gallery";
import "photoswipe/style.css";
import styles from "./LightboxGallery.module.scss";

// Elementor-lightbox look: thin grey icons (hsla(0,0%,93%,.9), white on hover).
const icon = (size, path, extra = "") =>
  `<svg class="pswp__icn" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"${extra}>${path}</svg>`;

const CHEVRON_LEFT = icon(25, '<path d="m15 4-8 8 8 8"/>');
const CLOSE = icon(20, '<path d="m4 4 16 16M20 4 4 20"/>');
const ZOOM = icon(
  20,
  '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M8 10.5h5"/><path class="pswp__zoom-icn-bar-v" d="M10.5 8v5"/>',
);
const FULLSCREEN = icon(
  20,
  '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
);

const OPTIONS = {
  bgOpacity: 0.8,
  showHideAnimationType: "fade",
  loop: true,
  wheelToZoom: false,
  padding: { top: 60, bottom: 60, left: 70, right: 70 },
  mainClass: styles.lightbox,
  arrowPrevSVG: CHEVRON_LEFT,
  arrowNextSVG: CHEVRON_LEFT,
  closeSVG: CLOSE,
  zoomSVG: ZOOM,
  arrowPrevTitle: "Previous image",
  arrowNextTitle: "Next image",
  closeTitle: "Close (Esc)",
  zoomTitle: "Zoom",
};

const UI_ELEMENTS = [
  {
    name: "fullscreen",
    order: 9, // before zoom (10) and close (20), as on live
    isButton: true,
    title: "Toggle fullscreen",
    html: FULLSCREEN,
    onInit: (element) => {
      if (!document.fullscreenEnabled) element.hidden = true;
    },
    onClick: (_event, _element, pswp) => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      } else {
        pswp.element?.requestFullscreen?.();
      }
    },
  },
];

/**
 * One lightbox slideshow (PhotoSwipe, styled like the live Elementor
 * lightbox: 80% black, "n / N" counter top left, fullscreen / zoom / close top
 * right, chevrons at the sides, loop, keyboard, swipe, Esc; no captions, no
 * share menu per OQ-38). Wrap the <ImageTile>s of one widget (or one gallery
 * tab) in it; tile order = slide order.
 */
export default function LightboxGallery({ children }) {
  return (
    <Gallery
      options={OPTIONS}
      uiElements={UI_ELEMENTS}
      onOpen={(pswp) => {
        // Leave fullscreen when the lightbox closes.
        pswp.on("close", () => {
          if (document.fullscreenElement) document.exitFullscreen?.();
        });
      }}
    >
      {children}
    </Gallery>
  );
}
