import { absoluteUrl } from "@/lib/block57/seo";

/** robots.txt: public pages are crawlable; account and auth pages are not. */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard-",
          "/login/",
          "/register/",
          "/forgot-password/",
          "/reset-password/",
          "/verify-email/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
