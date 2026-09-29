import AdminProjectsTable from "@/components/property/dashboard/dashboard-admin-projects/AdminProjectsTable";

export const metadata = {
  title: "Admin Projects | Buytly",
};

export default function DashboardAdminProjectsPage() {
  return (
    <div className="dashboard_content_wrapper">
      <div className="dashboard dashboard__content bgc-white bdrs12">
        <AdminProjectsTable />
      </div>
    </div>
  );
}
