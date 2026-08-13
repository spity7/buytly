"use client";

import RequireAuth from "@/components/auth/RequireAuth";
import DashboardShell from "@/components/property/dashboard/DashboardShell";
import { DashboardPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth
      loadingFallback={
        <DashboardShell>
          <DashboardPageSkeleton />
        </DashboardShell>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
