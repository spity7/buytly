import localFont from "next/font/local";
import ExtensionHydrationFix from "../ExtensionHydrationFix";
import SiteProviders from "./SiteProviders";
import Header from "@/components/block57/layout/Header";
import Footer from "@/components/block57/layout/Footer";
import { SITE_PUBLIC_URL } from "@/data/brandAssets";
import { SITE_DESCRIPTION, SITE_NAME } from "@/content/block57/site";
import "@/styles/block57/global.scss";

/**
 * Root layout for the public Block 57 site. It has its own global stylesheet
 * and no Bootstrap/Homez CSS; the account area lives in `(app)`.
 *
 * Every page renders inside <main id="main-content"> between the Header and
 * the Footer (which also holds the floating WhatsApp link, so it sits in a
 * landmark), so pages must NOT render their own <main>. A page that opens
 * with a dark full-bleed hero renders <HeaderOverlay /> to get the transparent
 * header (see src/components/block57/layout/HeaderOverlay.js).
 */
export const metadata = {
  metadataBase: new URL(SITE_PUBLIC_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
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
  themeColor: "#f6f3ee",
};

const dmSans = localFont({
  src: "../../fonts/DMSans-latin.woff2",
  weight: "400 700",
  variable: "--b57-font-sans-local",
  display: "swap",
});

export default function SiteRootLayout({ children }) {
  return (
    // data-scroll-behavior: Next disables the CSS smooth scrolling during route
    // changes (new pages start at the top instantly).
    <html
      lang="en"
      className={dmSans.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ExtensionHydrationFix />
        <SiteProviders>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          {/* The floating WhatsApp link renders inside the footer landmark. */}
          <Footer />
        </SiteProviders>
      </body>
    </html>
  );
}
