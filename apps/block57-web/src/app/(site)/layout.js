import localFont from "next/font/local";
import ExtensionHydrationFix from "../ExtensionHydrationFix";
import SiteProviders from "./SiteProviders";
import { SITE_NAME } from "@/lib/siteMetadata";
import { SITE_PUBLIC_URL } from "@/data/brandAssets";
import "@/styles/block57/global.scss";

/**
 * Root layout for the public Block 57 site. It has its own global stylesheet
 * and no Bootstrap/Homez CSS; the account area lives in `(app)`.
 */
export const metadata = {
  metadataBase: new URL(SITE_PUBLIC_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_NAME} — refined residences in Cantonments, Accra.`,
};

const dmSans = localFont({
  src: "../../fonts/DMSans-latin.woff2",
  weight: "400 700",
  variable: "--b57-font-sans-local",
  display: "swap",
});

export default function SiteRootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ExtensionHydrationFix />
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
