"use client";

import HeaderAuthLink from "@/components/auth/HeaderAuthLink";
import AddPropertyLink from "@/components/auth/AddPropertyLink";
import MainMenu from "@/components/common/MainMenu";
import {
  BRAND_LOGO_DARK,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WHITE,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/data/brandAssets";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Header = () => {
  const [navbar, setNavbar] = useState(false);

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => {
      window.removeEventListener("scroll", changeBackground);
    };
  }, []);

  return (
    <>
      <header
        className={`header-nav nav-homepage-style at-home2 main-menu  ${
          navbar ? "sticky slideInDown animated" : ""
        }`}
      >
        <nav className="posr">
          <div className="container maxw1600 posr">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="logos mr40">
                    <Link className="header-logo logo1" href="/">
                      <Image
                        width={BRAND_LOGO_WIDTH}
                        height={BRAND_LOGO_HEIGHT}
                        src={BRAND_LOGO_WHITE}
                        alt={BRAND_NAME}
                      />
                    </Link>
                    <Link className="header-logo logo2" href="/">
                      <Image
                        width={BRAND_LOGO_WIDTH}
                        height={BRAND_LOGO_HEIGHT}
                        src={BRAND_LOGO_DARK}
                        alt={BRAND_NAME}
                      />
                    </Link>
                  </div>
                  {/* End Logo */}

                  <MainMenu />
                  {/* End Main Menu */}
                </div>
              </div>
              {/* End .col-auto */}

              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <a
                    className="login-info d-flex align-items-center me-3"
                    href="tel:29110987654"
                  >
                    <i className="far fa-phone fz16 me-2"></i>
                    <span className="d-none d-xl-block">2 911 098 7654</span>
                  </a>
                  <HeaderAuthLink className="login-info d-flex align-items-center" />
                  <AddPropertyLink className="ud-btn add-property menu-btn bdrs60 mx-2 mx-xl-4" />
                </div>
              </div>
              {/* End .col-auto */}
            </div>
            {/* End .row */}
          </div>
        </nav>
      </header>
      {/* End Header */}
    </>
  );
};

export default Header;
