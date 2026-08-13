import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import PropertyForm from "@/components/property/dashboard/dashboard-add-property/PropertyForm";
import RequireListingRole from "@/components/auth/RequireListingRole";
import { DashboardListingPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";

export const metadata = {
  title: "Dashboard Add Property",
};

const DashboardAddProperty = () => {
  return (
    <RequireListingRole
      loadingSkeleton={<DashboardListingPageSkeleton variant="form" />}
    >
      <div className="row pb40 d-block d-lg-none">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <div className="row align-items-center pb40">
        <div className="col-lg-12">
          <div className="dashboard_title_area">
            <h2>Add New Property</h2>
            <p className="text">We are glad to see you again!</p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs12 default-box-shadow2 pt30 mb30 overflow-hidden position-relative">
            <PropertyForm />
          </div>
        </div>
      </div>
    </RequireListingRole>
  );
};

export default DashboardAddProperty;
