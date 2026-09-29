import RequireAdmin from "@/components/auth/RequireAdmin";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import AdminAnalyticsPanel from "@/components/property/dashboard/dashboard-admin-analytics/AdminAnalyticsPanel";

export const metadata = {
  title: "Admin Analytics | Dashboard",
};

export default function DashboardAdminAnalyticsPage() {
  return (
    <RequireAdmin>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <div className="row align-items-center pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Platform Analytics</h2>
            <p className="text mb0">
              KPI snapshot for users, listings, bookings, and transactions.
            </p>
          </div>
        </div>
      </div>

      <AdminAnalyticsPanel />
    </RequireAdmin>
  );
}
