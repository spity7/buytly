import Image from "next/image";
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WHITE,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/data/brandAssets";
import Link from "next/link";
import ContactMeta from "./ContactMeta";
import AppWidget from "./AppWidget";
import Social from "./Social";
import Subscribe from "./Subscribe";
import MenuWidget from "./MenuWidget";
import Copyright from "./Copyright";

const Footer = () => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-5">
            <div className="footer-widget mb-4 mb-lg-5">
              <Link className="footer-logo" href="/">
                                <Image
                  width={BRAND_LOGO_WIDTH}
                  height={BRAND_LOGO_HEIGHT}
                  className="mb40"
                  src={BRAND_LOGO_WHITE}
                  alt={BRAND_NAME}
                />
              </Link>
              <ContactMeta />
              <AppWidget />
              <div className="social-widget">
                <h6 className="text-white mb20">Follow us on social media</h6>
                <Social />
              </div>
            </div>
          </div>
          {/* End .col-lg-5 */}

          <div className="col-lg-7">
            <div className="footer-widget mb-4 mb-lg-5">
              <Subscribe />
              <div className="row justify-content-between">
                <MenuWidget />
              </div>
            </div>
          </div>
        </div>
        {/* End .row */}
      </div>
      {/* End .container */}

      <Copyright />
      {/* End copyright */}
    </>
  );
};

export default Footer;
