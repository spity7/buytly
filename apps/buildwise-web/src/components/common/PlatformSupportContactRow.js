import {
  getPlatformSupportEmail,
  getPlatformSupportMailtoUrl,
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";

/**
 * Two-column support phone + email row (e.g. home feature property sliders).
 */
export default function PlatformSupportContactRow({
  phoneTitleClassName = "info-title ff-heading mb-2",
  mailTitleClassName = "info-title ff-heading mb-2",
}) {
  const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
    PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
  );
  const supportPhoneDisplay = getPlatformSupportPhoneDisplay();
  const supportEmail = getPlatformSupportEmail();
  const supportMailto = getPlatformSupportMailtoUrl();

  return (
    <>
      <div className="col-auto">
        <div className="contact-info">
          <p className={phoneTitleClassName}>Total Free Customer Care</p>
          {supportPhoneDisplay && supportWhatsAppUrl ? (
            <h6 className="info-phone">
              <a
                href={supportWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {supportPhoneDisplay}
              </a>
            </h6>
          ) : null}
        </div>
      </div>
      <div className="col-auto">
        <div className="contact-info">
          <p className={mailTitleClassName}>Need Live Support?</p>
          {supportEmail && supportMailto ? (
            <h6 className="info-mail">
              <a href={supportMailto}>{supportEmail}</a>
            </h6>
          ) : null}
        </div>
      </div>
    </>
  );
}
