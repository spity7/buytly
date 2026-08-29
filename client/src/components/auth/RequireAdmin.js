"use client";

import { DashboardPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAdmin({
  children,
  loadingSkeleton = <DashboardPageSkeleton />,
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/?auth=signin");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/dashboard-home");
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
    return loadingSkeleton;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return children;
}
