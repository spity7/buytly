import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import MyPropertiesPanel from "@/components/property/dashboard/dashboard-my-properties/MyPropertiesPanel";
import RequireListingRole from "@/components/auth/RequireListingRole";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("My Properties");

const DashboardMyProperties = () => {
  return (
    <RequireListingRole>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <MyPropertiesPanel />
    </RequireListingRole>
  );
};

export default DashboardMyProperties;
