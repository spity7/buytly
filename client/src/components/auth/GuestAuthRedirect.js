"use client";

import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GuestAuthRedirect = ({ authTab }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.replace(AUTHENTICATED_HOME);
      return;
    }

    router.replace(`/?auth=${authTab}`);
  }, [authTab, isAuthenticated, isLoading, router]);

  return (
    <div className="d-flex align-items-center justify-content-center py200">
      <div className="spinner-border text-thm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default GuestAuthRedirect;
