import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/siteMetadata";
import { NOT_FOUND_TITLE } from "@/content/block57/site";

// Same title as not-found.js, so the tab title survives client hydration.
export const metadata = pageMetadata(NOT_FOUND_TITLE);

// Catch-all for unmatched URLs: render `(site)/not-found.js` with a real 404.
export default function CatchAllNotFound() {
  notFound();
}
