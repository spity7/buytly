"use client";

import AuthModalTrigger from "@/components/common/login-signup-modal/AuthModalTrigger";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const HeaderAuthLink = ({
  className = "login-info d-flex align-items-center",
}) => {
  const hasMounted = useHasMounted();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (!hasMounted || isLoading) {
    return (
      <AuthModalTrigger as="a" className={className}>
        <i className="far fa-user-circle fz16 me-2" />
        <span className="d-none d-xl-block">Login / Register</span>
      </AuthModalTrigger>
    );
  }

  if (isAuthenticated) {
    const displayName =
      user?.firstName || user?.email?.split("@")[0] || "Account";

    return (
      <Link href="/dashboard-home" className={className}>
        <i className="far fa-user-circle fz16 me-2" />
        <span className="d-none d-xl-block">{displayName}</span>
      </Link>
    );
  }

  return (
    <AuthModalTrigger as="a" className={className}>
      <i className="far fa-user-circle fz16 me-2" />
      <span className="d-none d-xl-block">Login / Register</span>
    </AuthModalTrigger>
  );
};

export default HeaderAuthLink;
