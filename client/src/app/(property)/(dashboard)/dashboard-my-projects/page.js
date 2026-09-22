import RequireListingRole from "@/components/auth/RequireListingRole";
import MyProjectsPanel from "@/components/property/dashboard/dashboard-projects/MyProjectsPanel";

export const metadata = {
  title: "My Projects | Buytly",
};

export default function DashboardMyProjectsPage() {
  return (
    <RequireListingRole>
      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard__content bgc-white bdrs12">
          <MyProjectsPanel />
        </div>
      </div>
    </RequireListingRole>
  );
}
