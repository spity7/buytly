import React from "react";
import {
  getPlatformSupportEmail,
  getPlatformSupportMailtoUrl,
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";
import { isWhatsAppUrl } from "@/lib/phone/whatsapp";

const supportPhoneDisplay = getPlatformSupportPhoneDisplay();
const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
);
const supportEmail = getPlatformSupportEmail();
const supportMailto = getPlatformSupportMailtoUrl();

const ContactMeta = () => {
  const contactInfoData = [
    {
      text: "Address",
      info: "329 Queensberry Street, North Melbourne VIC 3051, Australia.",
      link: "#",
    },
    {
      text: "Total Free Customer Care",
      info: supportPhoneDisplay,
      link: supportWhatsAppUrl || "#",
      external: Boolean(supportWhatsAppUrl),
    },
    {
      text: "Need Live Support?",
      info: supportEmail,
      link: supportMailto || "#",
    },
  ];

  return (
    <div className="row mb-4 mb-lg-5">
      {contactInfoData.map((contact, index) => (
        <div className="contact-info mb25" key={index}>
          <p className="info-title mb5">{contact.text}</p>
          {contact.link.startsWith("mailto:") ? (
            <h6 className="info-mail">
              <a href={contact.link}>{contact.info}</a>
            </h6>
          ) : (
            <h6 className="info-phone">
              <a
                href={contact.link}
                {...(contact.external || isWhatsAppUrl(contact.link)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {contact.info}
              </a>
            </h6>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactMeta;
