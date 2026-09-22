import ProjectWizard from "@/components/property/dashboard/dashboard-projects/ProjectWizard";
import RequireListingRole from "@/components/auth/RequireListingRole";

export const metadata = {
  title: "Add New Project | Buytly",
};

export default function DashboardAddProjectPage() {
  return (
    <RequireListingRole>
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard__content bgc-white bdrs12">
          <div className="row pb40">
            <div className="col-lg-12">
              <div className="dashboard_title_area">
                <h2>Add New Project</h2>
                <p className="text mb0">
                  Create a single or compound project, then add sellable units.
                </p>
              </div>
            </div>
          </div>
          <ProjectWizard />
        </div>
      </div>
    </RequireListingRole>
  );
}
