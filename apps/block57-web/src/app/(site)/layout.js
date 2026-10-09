// Global tokens and element defaults first, so component CSS Modules follow them.
import "@/styles/block57/global.scss";
import localFont from "next/font/local";
import ExtensionHydrationFix from "../ExtensionHydrationFix";
import SiteProviders from "./SiteProviders";
import Header from "@/components/block57/layout/Header";
import Footer from "@/components/block57/layout/Footer";
import GoogleTagManager from "@/components/block57/layout/GoogleTagManager";
import { SITE_PUBLIC_URL } from "@/data/brandAssets";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/content/block57/site";
import { TITLE_TEMPLATE } from "@/lib/block57/seo";

/**
 * Root layout for the public Block 57 site. It has its own global stylesheet
 * and no Bootstrap/Homez CSS; the account area lives in `(app)`.
 *
 * Every page renders inside <main id="main-content"> between the Header and
 * the Footer (which also holds the floating WhatsApp / Inquire buttons, so
 * they sit in a landmark), so pages must NOT render their own <main>. The
 * header is absolutely positioned and transparent over the top of the page,
 * as on the live site: every page must open with a dark hero (PageHero, or the
 * home video hero).
 */
export const metadata = {
  metadataBase: new URL(SITE_PUBLIC_URL),
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GH",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// Live theme fonts, self-hosted (OQ-31: licence to confirm). URW Gothic L has a
// single Demi face: registering it for 300–700 makes the 300 and 600 requests
// both use it with no synthesised bold, as on live.
const urwGothic = localFont({
  src: "../../fonts/URWGothicL-Demi.woff2",
  weight: "300 700",
  style: "normal",
  variable: "--b57-font-display-local",
  display: "swap",
});

// Inputs request 500 and <strong> 700: both resolve to Regular (bold is
// synthesised for <strong>, as on live).
const sentient = localFont({
  src: [
    {
      path: "../../fonts/Sentient-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fonts/Sentient-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--b57-font-body-local",
  display: "swap",
});

// Montserrat ExtraLight (OFL, latin subset from Google Fonts, self-hosted;
// licence text in src/fonts/Montserrat-OFL.txt):
// home hero tagline only, so it is not preloaded on every page.
const montserrat = localFont({
  src: "../../fonts/Montserrat-ExtraLight.woff2",
  weight: "200",
  style: "normal",
  variable: "--b57-font-tagline-local",
  display: "swap",
  preload: false,
});

export default function SiteRootLayout({ children }) {
  return (
    // data-scroll-behavior: Next disables the CSS smooth scrolling during route
    // changes (new pages start at the top instantly).
    <html
      lang="en"
      className={[
        urwGothic.variable,
        sentient.variable,
        montserrat.variable,
      ].join(" ")}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <GoogleTagManager />
        <ExtensionHydrationFix />
        <SiteProviders>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          {/* The floating WhatsApp / Inquire buttons render inside the footer landmark. */}
          <Footer />
        </SiteProviders>
      </body>
    </html>
  );
}
