import { buildWhatsAppUrl } from "@/lib/phone/whatsapp";

export function getSiteDisplayName() {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Block 57";
}

export const PLATFORM_SUPPORT_WHATSAPP_MESSAGE = `Hi, I need help with ${getSiteDisplayName()}.`;

export const PLATFORM_SUPPORT_MAILTO_SUBJECT = `${getSiteDisplayName()} support request`;

const DEFAULT_SUPPORT_EMAIL = "info@block-57.com";
const DEFAULT_SUPPORT_PHONE = "+233244777772";
const DEFAULT_SUPPORT_PHONE_DISPLAY = "+233 244 777 772";

export function getPlatformSupportEmail() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
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
