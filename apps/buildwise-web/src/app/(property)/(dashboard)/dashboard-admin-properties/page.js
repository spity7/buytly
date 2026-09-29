import AdminPropertiesTable from "@/components/property/dashboard/dashboard-admin-properties/AdminPropertiesTable";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import RequireAdmin from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Moderate Listings",
};

export default function DashboardAdminPropertiesPage() {
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
            <h2>Moderate Listings</h2>
            <p className="text">
              Review pending submissions and manage listing statuses.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <AdminPropertiesTable />
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
