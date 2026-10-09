import React from "react";
import Link from "next/link";
import { ACCOUNT_FOOTER_LINKS } from "@/components/common/AccountFooter";
import { BRAND_NAME } from "@/data/brandAssets";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard_footer pt30 pb10">
      <div className="container">
        <div className="row items-center justify-content-center justify-content-md-between">
          <div className="col-auto">
            <div className="copyright-widget">
              <p className="text">
                © {currentYear} {BRAND_NAME}
              </p>
            </div>
          </div>

          <div className="col-auto">
            <div className="footer_bottom_right_widgets text-center text-lg-end">
              <p>
                {ACCOUNT_FOOTER_LINKS.map((link, index) => (
                  <React.Fragment key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                    {index !== ACCOUNT_FOOTER_LINKS.length - 1 && " · "}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
