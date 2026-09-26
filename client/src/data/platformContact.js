import { buildWhatsAppUrl } from "@/lib/phone/whatsapp";

export const PLATFORM_SUPPORT_EMAIL = "hi@buytly.com";

export const PLATFORM_SUPPORT_WHATSAPP_MESSAGE = "Hi, I need help with Buytly.";

const DEFAULT_SUPPORT_PHONE = "+96171601751";
const DEFAULT_SUPPORT_PHONE_DISPLAY = "+961 71 601 751";

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
