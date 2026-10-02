import UnitPropertyDashboard from "@/components/property/dashboard/dashboard-add-property/UnitPropertyDashboard";
import RequireListingRole from "@/components/auth/RequireListingRole";
import { DashboardListingPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Edit Unit");

const DashboardEditProperty = async (props) => {
  const params = await props.params;

  return (
    <RequireListingRole
      loadingSkeleton={<DashboardListingPageSkeleton variant="form" />}
    >
      <UnitPropertyDashboard propertyId={params.id} />
    </RequireListingRole>
  );
};

export default DashboardEditProperty;
