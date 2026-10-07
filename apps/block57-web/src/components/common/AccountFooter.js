import Image from "next/image";
import Link from "next/link";
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WHITE,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/data/brandAssets";
import {
  getPlatformSupportEmail,
  getPlatformSupportPhone,
  getPlatformSupportPhoneDisplay,
} from "@/data/platformContact";

/** Public Block 57 pages linked from the account-area footers. */
export const ACCOUNT_FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/apartments/", label: "Apartments" },
  { href: "/inquire/", label: "Inquire" },
];

/** Minimal footer for the auth pages (login, password reset, email verification). */
export default function AccountFooter() {
  const year = new Date().getFullYear();
  const email = getPlatformSupportEmail();
  const phone = getPlatformSupportPhone().replace(/[^\d+]/g, "");

  return (
    <footer className="footer-style1 account-footer">
      <div className="container">
        <div className="account-footer__top">
          <Link className="account-footer__logo" href="/">
            <Image
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              src={BRAND_LOGO_WHITE}
              alt={BRAND_NAME}
            />
          </Link>

          <nav aria-label="Footer">
            <ul className="account-footer__links">
              {ACCOUNT_FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="account-footer__contact">
            {phone ? (
              <li>
                <a href={`tel:${phone}`}>
                  <span className="flaticon-call" aria-hidden="true" />
                  {getPlatformSupportPhoneDisplay()}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`}>
                  <span className="flaticon-email" aria-hidden="true" />
                  {email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <p className="account-footer__copyright">
          © {year} {BRAND_NAME}
        </p>
      </div>
    </footer>
  );
}
