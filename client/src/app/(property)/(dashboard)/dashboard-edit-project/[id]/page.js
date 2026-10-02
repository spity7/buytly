import RequireListingRole from "@/components/auth/RequireListingRole";
import ProjectEditDashboard from "@/components/property/dashboard/dashboard-projects/ProjectEditDashboard";
import { DashboardListingPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Edit Project");

export default async function DashboardEditProjectPage({ params }) {
  const { id } = await params;

  return (
    <RequireListingRole
      loadingSkeleton={<DashboardListingPageSkeleton variant="form" />}
    >
      <ProjectEditDashboard projectId={id} />
    </RequireListingRole>
  );
}
