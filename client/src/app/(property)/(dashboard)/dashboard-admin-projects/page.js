import RequireAdmin from "@/components/auth/RequireAdmin";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import AdminProjectsTable from "@/components/property/dashboard/dashboard-admin-projects/AdminProjectsTable";

export const metadata = {
  title: "Moderate Projects | Buytly",
};

export default function DashboardAdminProjectsPage() {
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
            <h2>Moderate projects</h2>
            <p className="text mb0">
              Review seller submissions, approve launches, and manage project
              status.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <AdminProjectsTable />
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
