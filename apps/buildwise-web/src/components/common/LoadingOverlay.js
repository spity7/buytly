"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

const LoadingOverlay = ({ open, message = "Loading..." }) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="loading-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="polite"
      aria-label={message}
    >
      <div className="loading-overlay__backdrop" aria-hidden="true" />
      <div className="loading-overlay__dialog">
        <div className="loading-overlay__spinner" aria-hidden="true" />
        <p className="loading-overlay__message mb0">{message}</p>
      </div>
    </div>,
    document.body,
  );
};

export default LoadingOverlay;
