"use client";

import AccountHeaderAvatar, {
  getAccountLabel,
} from "@/components/auth/AccountHeaderAvatar";
import NotificationBell from "@/components/notifications/NotificationBell";
import MainMenu from "@/components/common/MainMenu";
import {
  BRAND_LOGO_DARK,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/data/brandAssets";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import Link from "next/link";

const DashboardHeader = () => {
  const { user } = useAuth();
  const hasAvatar = Boolean(user?.avatar?.url);
  const accountLabel = getAccountLabel(user);

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
                        width={BRAND_LOGO_WIDTH}
                        height={BRAND_LOGO_HEIGHT}
                        src={BRAND_LOGO_DARK}
                        alt={BRAND_NAME}
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
                        className="header-action-btn"
                        href="/dashboard-message"
                        aria-label="Messages"
                      >
                        <span className="flaticon-email" aria-hidden="true" />
                      </Link>
                    </li>
                    {/* End email box */}

                    <NotificationBell />
                    {/* End notification icon */}

                    <li className="user_setting">
                      <Link
                        href={AUTHENTICATED_HOME}
                        className={`header-action-btn header-user-avatar-btn${hasAvatar ? "" : " header-user-avatar-btn--icon"}`}
                        aria-label={`${accountLabel}, go to dashboard`}
                      >
                        <AccountHeaderAvatar user={user} />
                      </Link>
                    </li>
                    {/* End profile link */}
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
