import Script from "next/script";
import { GTM_ID } from "@/content/block57/site";

// Container ids look like "GTM-ABC1234"; anything else is ignored so the env
// value can never inject script.
const VALID_GTM_ID = /^GTM-[A-Z0-9]+$/;

/**
 * Google Tag Manager, only when NEXT_PUBLIC_GTM_ID is set at build time (unset
 * by default: no tracking code loads). Consent requirements are open (OQ-30).
 */
export default function GoogleTagManager() {
  if (!VALID_GTM_ID.test(GTM_ID)) return null;
  return (
    <>
      <Script id="b57-gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          title="Google Tag Manager"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
