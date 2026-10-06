import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/siteMetadata";

// Same title as not-found.js, so the tab title survives client hydration.
export const metadata = pageMetadata("Page Not Found");

// Catch-all for unmatched URLs: render `(site)/not-found.js` with a real 404.
export default function CatchAllNotFound() {
  notFound();
}
