import RequireListingRole from "@/components/auth/RequireListingRole";
import PropertyForm from "@/components/property/dashboard/dashboard-add-property/PropertyForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Add Unit | Buytly",
};

export default async function DashboardAddPropertyPage({ searchParams }) {
  const params = await searchParams;
  const projectId = params?.projectId;

  if (!projectId) {
    redirect("/dashboard-add-project");
  }

  return (
    <RequireListingRole>
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard__content bgc-white bdrs12">
          <div className="row pb40">
            <div className="col-lg-12">
              <div className="dashboard_title_area">
                <h2>Add unit</h2>
                <p className="text mb0">
                  Unit location is inherited from the parent project.
                </p>
              </div>
            </div>
          </div>
          <PropertyForm projectId={projectId} />
        </div>
      </div>
    </RequireListingRole>
  );
}
