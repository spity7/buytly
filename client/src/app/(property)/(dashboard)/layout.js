"use client";

import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/property/dashboard/DashboardShell";

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
