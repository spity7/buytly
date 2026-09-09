import RequireAdmin from "@/components/auth/RequireAdmin";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import AdminUsersTable from "@/components/property/dashboard/dashboard-admin-users/AdminUsersTable";

export const metadata = {
  title: "Admin Users | Dashboard",
};

export default function DashboardAdminUsersPage() {
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
            <h2>User Management</h2>
            <p className="text mb0">
              Review accounts, change roles, and activate or deactivate users.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <AdminUsersTable />
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
