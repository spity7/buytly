import { buildWhatsAppUrl } from "@/lib/phone/whatsapp";

function getSiteDisplayName() {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Buytly";
}

export const PLATFORM_SUPPORT_WHATSAPP_MESSAGE = `Hi, I need help with ${getSiteDisplayName()}.`;

export const PLATFORM_SUPPORT_MAILTO_SUBJECT = `${getSiteDisplayName()} support request`;

const DEFAULT_SUPPORT_EMAIL = "buytlyonline@gmail.com";
const DEFAULT_SUPPORT_PHONE = "+96171601751";
const DEFAULT_SUPPORT_PHONE_DISPLAY = "+961 71 601 751";

export function getPlatformSupportEmail() {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL
  );
}

export function getPlatformSupportMailtoUrl({
  subject = PLATFORM_SUPPORT_MAILTO_SUBJECT,
  body,
} = {}) {
  const email = getPlatformSupportEmail();
  if (!email) {
    return null;
  }

  const params = new URLSearchParams();
  if (subject?.trim()) {
    params.set("subject", subject.trim());
  }
  if (body?.trim()) {
    params.set("body", body.trim());
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

export function getPlatformSupportPhone() {
  return process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || DEFAULT_SUPPORT_PHONE;
}

export function getPlatformSupportPhoneDisplay() {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY?.trim() ||
    DEFAULT_SUPPORT_PHONE_DISPLAY
  );
}

export function getPlatformSupportWhatsAppUrl(
  message = PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
) {
  return buildWhatsAppUrl(getPlatformSupportPhone(), { text: message });
}
