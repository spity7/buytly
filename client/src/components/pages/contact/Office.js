import Image from "next/image";
import React from "react";
import {
  getPlatformSupportPhoneDisplay,
  getPlatformSupportWhatsAppUrl,
  PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
} from "@/data/platformContact";

const Office = () => {
  const supportPhone = getPlatformSupportPhoneDisplay();
  const supportWhatsAppUrl = getPlatformSupportWhatsAppUrl(
    PLATFORM_SUPPORT_WHATSAPP_MESSAGE,
  );

  const offices = [
    {
      id: 1,
      city: "Paris",
      icon: "/images/icon/paris.svg",
      address: "1301 2nd Ave, Seattle, WA 98101",
    },
    {
      id: 2,
      city: "London",
      icon: "/images/icon/london.svg",
      address: "1301 2nd Ave, Seattle, WA 98101",
    },
    {
      id: 3,
      city: "New York",
      icon: "/images/icon/new-york.svg",
      address: "1301 2nd Ave, Seattle, WA 98101",
    },
  ];

  return (
    <>
      {offices.map((office) => (
        <div className="col-sm-6 col-lg-4" key={office.id}>
          <div className="iconbox-style8 text-center">
            <div className="icon">
              <Image width={120} height={120} src={office.icon} alt="icon" />
            </div>
            <div className="iconbox-content">
              <h4 className="title">{office.city}</h4>
              <p className="text mb-1">{office.address}</p>
              {supportPhone && supportWhatsAppUrl ? (
                <h6 className="mb10">
                  <a
                    href={supportWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {supportPhone}
                  </a>
                </h6>
              ) : null}
              <a className="text-decoration-underline" href="#">
                Open Google Map
              </a>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Office;
