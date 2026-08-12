"use client";

import AuthModalTrigger from "@/components/common/login-signup-modal/AuthModalTrigger";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const HeaderAuthLink = ({
  className = "login-info d-flex align-items-center",
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <span
        className={`${className} header-auth-link--loading`}
        aria-busy="true"
        aria-label="Loading account"
      >
        <i className="far fa-user-circle fz16 me-2" />
        <span className="d-none d-xl-block header-auth-link__placeholder" />
      </span>
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
