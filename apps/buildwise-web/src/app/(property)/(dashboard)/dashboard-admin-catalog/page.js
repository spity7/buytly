import RequireAdmin from "@/components/auth/RequireAdmin";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import AdminCatalogManager from "@/components/property/dashboard/dashboard-admin-catalog/AdminCatalogManager";

export const metadata = {
  title: "Listing Catalog | Admin Dashboard",
};

export default function DashboardAdminCatalogPage() {
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
            <h2>Property types &amp; amenities</h2>
            <p className="text mb0">
              Manage the options sellers and agents see when creating listings.
              Deactivate items instead of deleting when they are already in use.
            </p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
            <AdminCatalogManager />
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
