import React from "react";
import {
  getPlatformSupportEmail,
  getPlatformSupportMailtoUrl,
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";
import {
  SITE_PUBLIC_WWW_LABEL,
  SITE_PUBLIC_WWW_LINK,
} from "@/data/brandAssets";

const InvoiceFooter = () => {
  const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
    PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
  );
  const supportEmail = getPlatformSupportEmail();
  const supportMailto = getPlatformSupportMailtoUrl();

  const footerData = [
    {
      text: SITE_PUBLIC_WWW_LABEL,
      link: SITE_PUBLIC_WWW_LINK,
    },
    {
      text: supportEmail,
      link: supportMailto || "#",
    },
    {
      text: getPlatformSupportPhoneDisplay(),
      link: supportWhatsAppUrl || "#",
      external: Boolean(supportWhatsAppUrl),
    },
  ];

  return (
    <>
      {footerData.map((data, index) => (
        <div className="col-auto" key={index}>
          <div className="invoice_footer_content text-center">
            <a
              className="ff-heading"
              href={data.link}
              {...(data.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {data.text}
            </a>
          </div>
        </div>
      ))}
    </>
  );
};

export default InvoiceFooter;
