"use client";

import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { usePathname } from "next/navigation";

const DashboardShell = ({ children }) => {
  const pathname = usePathname();
  const isAddPropertyPage = pathname === "/dashboard-add-property";
  const isProfilePage = pathname === "/dashboard-my-profile";
  const wrapperClass = isAddPropertyPage
    ? "dashboard dashboard_wrapper pr30 pr0-md"
    : "dashboard dashboard_wrapper pr30 pr0-xl";
  const contentClass = isAddPropertyPage
    ? "dashboard__content property-page bgc-f7"
    : "dashboard__content bgc-f7";

  return (
    <>
      <DashboardHeader />
      <MobileMenu />

      <div className="dashboard_content_wrapper">
        <SidebarDashboard />

        <div className={wrapperClass}>
          <div className="dashboard__main pl0-md">
            <div className={contentClass}>
              {!isProfilePage ? <EmailVerificationBanner /> : null}
              {children}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardShell;
