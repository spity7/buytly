"use client";

import HeaderAuthLink from "@/components/auth/HeaderAuthLink";
import AddPropertyLink from "@/components/auth/AddPropertyLink";
import MainMenu from "@/components/common/MainMenu";
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
        className={`header-nav nav-homepage-style light-header menu-home4 main-menu ${
          navbar ? "sticky slideInDown animated" : ""
        }`}
      >
        <nav className="posr">
          <div className="container maxw1600 posr menu_bdrt1">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <MainMenu />
                {/* End Main Menu */}
              </div>
              {/* End .col-auto */}

              <div className="col-auto">
                <Link className="header-logo" href="/">
                  <Image
                    width={138}
                    height={44}
                    src="/images/header-logo3.svg"
                    alt="Header Logo"
                  />
                </Link>
              </div>
              {/* End .col-auto */}

              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <HeaderAuthLink className="login-info d-flex align-items-center" />
                  <AddPropertyLink className="ud-btn btn-dark add-property bdrs0 mx-2 mx-xl-4" />
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
