"use client";

import {
  buildAuthEntryUrl,
  getCurrentPathForNext,
} from "@/lib/auth/authIntent";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RequireAuth = ({ children, loadingFallback = null }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(buildAuthEntryUrl({ next: getCurrentPathForNext() }));
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="d-flex align-items-center justify-content-center py200">
          <div className="spinner-border text-thm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default RequireAuth;
