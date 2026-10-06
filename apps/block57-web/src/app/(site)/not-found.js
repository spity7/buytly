import Link from "next/link";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Page Not Found");

export default function SiteNotFound() {
  return (
    <main className="b57-container b57-placeholder">
      <p className="b57-not-found__code" aria-hidden="true">
        404
      </p>
      <h1>Page not found</h1>
      <p className="b57-placeholder__lead">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <p>
        <Link href="/" className="b57-button">
          Back to home
        </Link>
      </p>
    </main>
  );
}
