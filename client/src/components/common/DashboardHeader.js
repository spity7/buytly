"use client";

import MainMenu from "@/components/common/MainMenu";
import LogoutButton from "@/components/auth/LogoutButton";
import { getDashboardNavSections } from "@/lib/dashboard/navSections";
import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const DashboardHeader = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const avatarSrc = user?.avatar?.url || "/images/resource/user.png";

  const menuItems = getDashboardNavSections(user?.role);

  return (
    <>
      <header className="header-nav nav-homepage-style light-header position-fixed menu-home4 main-menu">
        <nav className="posr">
          <div className="container-fluid pr30 pr15-xs pl30 posr menu_bdrt1">
            <div className="row align-items-center justify-content-between">
              <div className="col-6 col-lg-auto">
                <div className="text-center text-lg-start d-flex align-items-center">
                  <div className="dashboard_header_logo position-relative me-2 me-xl-5">
                    <Link className="logo" href="/">
                      <Image
                        width={138}
                        height={44}
                        src="/images/header-logo2.svg"
                        alt="Header Logo"
                      />
                    </Link>
                  </div>
                  {/* End Logo */}
                </div>
              </div>
              {/* End .col-auto */}

              <div className="d-none d-lg-block col-lg-auto">
                <MainMenu />
                {/* End Main Menu */}
              </div>
              {/* End d-none d-lg-block */}

              <div className="col-6 col-lg-auto">
                <div className="text-center text-lg-end header_right_widgets">
                  <ul className="mb0 d-flex justify-content-center justify-content-sm-end p-0">
                    <li className="d-none d-sm-block">
                      <Link
                        className="text-center mr15"
                        href="/dashboard-message"
                      >
                        <span className="flaticon-email" />
                      </Link>
                    </li>
                    {/* End email box */}

                    <li className="d-none d-sm-block">
                      <a className="text-center mr20 notif" href="#">
                        <span className="flaticon-bell" />
                      </a>
                    </li>
                    {/* End notification icon */}

                    <li className=" user_setting">
                      <div className="dropdown">
                        <a className="btn" href="#" data-bs-toggle="dropdown">
                          <Image
                            width={44}
                            height={44}
                            src={avatarSrc}
                            alt="user avatar"
                            unoptimized={isExternalImageSrc(avatarSrc)}
                          />
                        </a>
                        <div className="dropdown-menu">
                          <div className="user_setting_content">
                            {menuItems.map((section, sectionIndex) => (
                              <div key={sectionIndex}>
                                <p
                                  className={`fz15 fw400 ff-heading ${
                                    sectionIndex === 0 ? "mb20" : "mt30"
                                  }`}
                                >
                                  {section.title}
                                </p>
                                {section.items.map((item, itemIndex) =>
                                  item.logout ? (
                                    <LogoutButton
                                      key={itemIndex}
                                      as="a"
                                      className="dropdown-item"
                                    >
                                      <i className={`${item.icon} mr10`} />
                                      {item.text}
                                    </LogoutButton>
                                  ) : (
                                    <Link
                                      key={itemIndex}
                                      className={`dropdown-item ${
                                        pathname == item.href
                                          ? "-is-active"
                                          : ""
                                      } `}
                                      href={item.href}
                                    >
                                      <i className={`${item.icon} mr10`} />
                                      {item.text}
                                    </Link>
                                  ),
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                    {/* End avatar dropdown */}
                  </ul>
                </div>
              </div>
              {/* End .col-6 */}
            </div>
            {/* End .row */}
          </div>
        </nav>
      </header>
      {/* End Header */}
    </>
  );
};

export default DashboardHeader;
