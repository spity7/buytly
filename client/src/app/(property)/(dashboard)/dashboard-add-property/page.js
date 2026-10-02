import RequireListingRole from "@/components/auth/RequireListingRole";
import UnitPropertyDashboard from "@/components/property/dashboard/dashboard-add-property/UnitPropertyDashboard";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Add Unit");

export default async function DashboardAddPropertyPage({ searchParams }) {
  const params = await searchParams;
  const projectId = params?.projectId;

  if (!projectId) {
    redirect("/dashboard-add-project");
  }

  return (
    <RequireListingRole>
      <UnitPropertyDashboard projectId={projectId} />
    </RequireListingRole>
  );
}
