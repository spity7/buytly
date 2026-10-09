"use client";

import AuthModalTrigger from "@/components/common/login-signup-modal/AuthModalTrigger";
import { useHasMounted } from "@/hooks/useHasMounted";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const AuthSignupCta = ({
  className,
  children,
  authenticatedLabel = "Go to Dashboard",
  authenticatedClassName,
}) => {
  const hasMounted = useHasMounted();
  const { isAuthenticated, isLoading } = useAuth();

  if (!hasMounted || isLoading) {
    return (
      <AuthModalTrigger tab="signup" className={className}>
        {children}
      </AuthModalTrigger>
    );
  }

  if (isAuthenticated) {
    return (
      <Link
        href={AUTHENTICATED_HOME}
        className={authenticatedClassName || className}
      >
        {authenticatedLabel} <i className="fal fa-arrow-right-long" />
      </Link>
    );
  }

  return (
    <AuthModalTrigger tab="signup" className={className}>
      {children}
    </AuthModalTrigger>
  );
};

export default AuthSignupCta;
