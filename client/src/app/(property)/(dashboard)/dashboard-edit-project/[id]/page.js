import RequireListingRole from "@/components/auth/RequireListingRole";
import ProjectEditPanel from "@/components/property/dashboard/dashboard-projects/ProjectEditPanel";

export const metadata = {
  title: "Edit Project | Buytly",
};

export default async function DashboardEditProjectPage({ params }) {
  const { id } = await params;

  return (
    <RequireListingRole>
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard__content bgc-white bdrs12">
          <ProjectEditPanel projectId={id} />
        </div>
      </div>
    </RequireListingRole>
  );
}
