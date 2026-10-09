import DashboardHomePanel from "@/components/property/dashboard/dashboard-home/DashboardHomePanel";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata("Dashboard");

export default function DashboardHome() {
  return <DashboardHomePanel />;
}
