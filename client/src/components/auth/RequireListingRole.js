"use client";

import { ADD_PROPERTY_PATH } from "@/lib/auth/authIntent";
import { canManageListings } from "@/lib/auth/roles";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardListingPageSkeleton } from "@/components/property/dashboard/skeletons/DashboardSkeletons";

export default function RequireListingRole({
  children,
  loadingSkeleton = <DashboardListingPageSkeleton variant="table" />,
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(
        `/?auth=signup&role=seller&next=${encodeURIComponent(ADD_PROPERTY_PATH)}&intent=listing`,
      );
      return;
    }

    if (!canManageListings(user?.role)) {
      router.replace("/dashboard-home");
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
    return loadingSkeleton;
  }

  if (!isAuthenticated || !canManageListings(user?.role)) {
    return null;
  }

  return children;
}
