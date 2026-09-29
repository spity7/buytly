import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import RequireListingRole from "@/components/auth/RequireListingRole";
import MyProjectsPanel from "@/components/property/dashboard/dashboard-projects/MyProjectsPanel";

export const metadata = {
  title: "My Projects | Buytly",
};

export default function DashboardMyProjectsPage() {
  return (
    <RequireListingRole>
      <div className="row pb40">
        <div className="col-lg-12">
          <DboardMobileNavigation />
        </div>
      </div>

      <MyProjectsPanel />
    </RequireListingRole>
  );
}
