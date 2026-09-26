import React from "react";
import {
  PLATFORM_SUPPORT_EMAIL,
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";

const ContactInfo = () => {
  const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
    PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
  );

  const contactInfo = [
    {
      id: 1,
      title: "Total Free Customer Care",
      phone: getPlatformSupportPhoneDisplay(),
      phoneHref: supportWhatsAppUrl,
    },
    {
      id: 2,
      title: "Need Live Support?",
      email: PLATFORM_SUPPORT_EMAIL,
      emailHref: `mailto:${PLATFORM_SUPPORT_EMAIL}`,
    },
  ];

  return (
    <>
      {contactInfo.map((info) => (
        <div className="col-auto" key={info.id}>
          <div className="contact-info">
            <p className="info-title dark-color">{info.title}</p>
            {info.phone && info.phoneHref ? (
              <h6 className="info-phone dark-color">
                <a
                  href={info.phoneHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {info.phone}
                </a>
              </h6>
            ) : null}
            {info.email ? (
              <h6 className="info-mail dark-color">
                <a href={info.emailHref}>{info.email}</a>
              </h6>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
};

export default ContactInfo;
