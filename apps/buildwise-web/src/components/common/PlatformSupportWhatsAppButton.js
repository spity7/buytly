import {
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";

export default function PlatformSupportWhatsAppButton({
  className = "ud-btn btn-dark",
  message = PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
}) {
  const href = getPlatformSupportWhatsAppUrl(message);
  const label = getPlatformSupportPhoneDisplay();

  if (!href || !label) {
    return null;
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="flaticon-whatsapp vam pe-2" aria-hidden="true" />
      {label}
    </a>
  );
}
