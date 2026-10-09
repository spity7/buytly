import Image from "next/image";
import {
  BRAND_LOGO_DARK,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/data/brandAssets";
import Link from "next/link";
import ContactMeta from "./ContactMeta";
import Social from "./Social";
import Subscribe from "./Subscribe";
import MenuWidget from "./MenuWidget";
import Copyright from "./Copyright";
import AppWidget from "./AppWidget";

const Footer = () => {
  return (
    <>
      <div className="container">
        <div className="row gray-bdrb1 pb30 mb60">
          <div className="col-sm-5">
            <div className="footer-widget text-center text-sm-start">
              <Link className="footer-logo" href="/">
                                <Image
                  width={BRAND_LOGO_WIDTH}
                  height={BRAND_LOGO_HEIGHT}
                  className="mb40"
                  src={BRAND_LOGO_DARK}
                  alt={BRAND_NAME}
                />
              </Link>
            </div>
          </div>
          {/* End .col */}

          <div className="col-sm-7">
            <div className="social-widget text-center text-sm-end">
              <Social />
            </div>
          </div>
          {/* End .col */}
        </div>
        {/* End .row */}

        <div className="row">
          <div className="col-md-6">
            <div className="row justify-content-between">
              <MenuWidget />
            </div>
          </div>
          {/* End .col */}

          <div className="col-md-6 col-lg-4 offset-lg-2">
            <div className="footer-widget light-style mb-4 mb-lg-50">
              <ContactMeta />
              <div className="footer-widget light-style mb30">
                <div className="mailchimp-widget ">
                  <h6 className="title mb20">Keep Yourself Up to Date</h6>
                  <Subscribe />
                </div>
              </div>
            </div>

            <AppWidget />
          </div>
          {/* End .col */}
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
