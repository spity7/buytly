import Link from "next/link";
import { AUTH_ENTRY_PATH } from "@/lib/auth/constants";
import { homePageMetadata } from "@/lib/siteMetadata";

export const metadata = homePageMetadata();

// Placeholder until the public site pages are built (plan Phase 3).
const PLACEHOLDER_LINKS = [
  { href: "/apartments/", label: "Apartments" },
  { href: "/life-style/", label: "Lifestyle" },
  { href: "/amenities/", label: "Amenities" },
  { href: "/inquire/", label: "Inquire" },
  { href: AUTH_ENTRY_PATH, label: "Sign in" },
];

export default function HomePage() {
  return (
    <main className="b57-container b57-placeholder">
      <span className="b57-eyebrow">Residences</span>
      <h1>Block 57 — Cantonments, Accra</h1>
      <p className="b57-placeholder__lead">
        Refined residences in the heart of Cantonments.
      </p>
      <nav aria-label="Site">
        <ul className="b57-placeholder__links">
          {PLACEHOLDER_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
