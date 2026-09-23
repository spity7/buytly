import UnitPropertyDashboard from "@/components/property/dashboard/dashboard-add-property/UnitPropertyDashboard";
import RequireListingRole from "@/components/auth/RequireListingRole";
import { DashboardListingPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";

export const metadata = {
  title: "Edit Unit | Buytly",
};

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
