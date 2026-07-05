import localFont from "next/font/local";
import ClientLayout from "./ClientLayout";
import ExtensionHydrationFix from "./ExtensionHydrationFix";
import "../../public/scss/main.scss";

const dmSans = localFont({
  src: "../fonts/DMSans-latin.woff2",
  weight: "400 700",
  variable: "--body-font-family",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "../fonts/Poppins-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Poppins-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--title-font-family",
  display: "swap",
});

export default function RootLayout({ children }) {
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
