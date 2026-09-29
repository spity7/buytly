"use client";

import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import DashboardInsights from "@/components/property/dashboard/dashboard-home/DashboardInsights";
import DashboardRecentActivities from "@/components/property/dashboard/dashboard-home/DashboardRecentActivities";
import DashboardTopStats from "@/components/property/dashboard/dashboard-home/DashboardTopStats";
import { useAuth } from "@/providers/AuthProvider";

function getDisplayName(user) {
  const parts = [user?.firstName, user?.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : user?.email || "there";
}

export default function DashboardHomePanel() {
  const { user } = useAuth();

  return (
    <>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>

        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Howdy, {getDisplayName(user)}!</h2>
            <p className="text">We are glad to see you again!</p>
          </div>
        </div>
      </div>

      <div className="row">
        <DashboardTopStats role={user?.role} />
      </div>

      <div className="row">
        <div className="col-xl-8">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <DashboardInsights role={user?.role} />
          </div>
        </div>

        <div className="col-xl-4">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <h4 className="title fz17 mb25">Recent Activities</h4>
            <DashboardRecentActivities />
          </div>
        </div>
      </div>
    </>
  );
}
