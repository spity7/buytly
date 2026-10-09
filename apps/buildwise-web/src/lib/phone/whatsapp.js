import { normalizePhoneNumber } from "./parsePhone";

/** Current site origin in the browser; empty during SSR (listing paths stay relative). */
export function getPublicSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return "";
}

export function isWhatsAppUrl(href) {
  if (!href || typeof href !== "string") {
    return false;
  }
  return /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href);
}

/**
 * Build a WhatsApp chat URL (wa.me). Phone may include spaces, dashes, or a leading +.
 */
export function buildWhatsAppUrl(phone, { text } = {}) {
  const digits = normalizePhoneNumber(phone);
  if (!digits) {
    return null;
  }

  const base = `https://wa.me/${digits}`;
  const message = text?.trim();
  if (!message) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}
