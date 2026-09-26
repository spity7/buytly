import React from "react";
import {
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";

const InvoiceFooter = () => {
  const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
    PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
  );

  const footerData = [
    {
      text: "www.Buytly.com",
      link: "https://www.Buytly.com",
    },
    {
      text: "invoice@Buytly.com",
      link: "mailto:invoice@Buytly.com",
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
