"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Block 57 toasts (styled by `.b57-toast` in global.scss). Bottom left on
 * desktop; on phones sonner spans the width, lifted clear of the floating
 * WhatsApp / Inquire buttons (25px + 2 × 54px + 8px gap).
 */
export default function Toaster() {
  return (
    <SonnerToaster
      position="bottom-left"
      closeButton
      visibleToasts={3}
      mobileOffset={{ bottom: 150 }}
      toastOptions={{ className: "b57-toast", duration: 4500 }}
    />
  );
}
