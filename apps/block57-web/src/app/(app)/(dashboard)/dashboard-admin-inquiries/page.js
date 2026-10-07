import RequireAdmin from "@/components/auth/RequireAdmin";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import AdminInquiriesTable from "@/components/property/dashboard/dashboard-admin-inquiries/AdminInquiriesTable";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Inquiries");

export default function DashboardAdminInquiriesPage() {
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
            <h2>Inquiries</h2>
            <p className="text mb0">
              Messages from the Inquire form. Follow up by email or phone, then
              update the status.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <AdminInquiriesTable />
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
