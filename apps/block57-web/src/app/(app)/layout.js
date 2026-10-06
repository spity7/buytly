import localFont from "next/font/local";
import ClientLayout from "./ClientLayout";
import ExtensionHydrationFix from "../ExtensionHydrationFix";
import { SITE_NAME } from "@/lib/siteMetadata";
import { SITE_PUBLIC_URL } from "@/data/brandAssets";
import "../../../public/scss/main.scss";

/**
 * Root layout for the account area (auth pages + dashboard), styled with the
 * Homez/Bootstrap theme. The public Block 57 site lives in `(site)` with its
 * own root layout, so neither group's global CSS leaks into the other.
 */
export const metadata = {
  metadataBase: new URL(SITE_PUBLIC_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_NAME} — refined residences in Cantonments, Accra.`,
  // Account and dashboard pages are never indexed.
  robots: {
    index: false,
    follow: false,
  },
};

const dmSans = localFont({
  src: "../../fonts/DMSans-latin.woff2",
  weight: "400 700",
  variable: "--body-font-family",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../../fonts/Poppins-300.woff2", weight: "300", style: "normal" },
    { path: "../../fonts/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/Poppins-700.woff2", weight: "700", style: "normal" },
    { path: "../../fonts/Poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--title-font-family",
  display: "swap",
});

export default function AppRootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`body ${poppins.variable} ${dmSans.variable}`}
        suppressHydrationWarning
      >
        <ExtensionHydrationFix />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
