import {
  PLATFORM_SUPPORT_EMAIL,
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";

/**
 * Footer / sidebar “Total Free Customer Care” + support email block.
 * Phone opens WhatsApp with the platform support line from env.
 */
export default function PlatformSupportContactMeta({
  titleClassName = "info-title",
  phoneHeadingClassName = "info-phone",
  mailHeadingClassName = "info-mail",
}) {
  const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
    PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
  );

  const contactInfoList = [
    {
      title: "Total Free Customer Care",
      phone: getPlatformSupportPhoneDisplay(),
      phoneLink: supportWhatsAppUrl,
    },
    {
      title: "Need Live Support?",
      mail: PLATFORM_SUPPORT_EMAIL,
      mailLink: `mailto:${PLATFORM_SUPPORT_EMAIL}`,
    },
  ];

  return (
    <div className="row mb-4 mb-lg-5">
      {contactInfoList.map((contact, index) => (
        <div className="col-auto" key={index}>
          <div className="contact-info">
            <p className={titleClassName}>{contact.title}</p>
            {contact.phone && contact.phoneLink ? (
              <h6 className={phoneHeadingClassName}>
                <a
                  href={contact.phoneLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.phone}
                </a>
              </h6>
            ) : null}
            {contact.mail ? (
              <h6 className={mailHeadingClassName}>
                <a href={contact.mailLink}>{contact.mail}</a>
              </h6>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
