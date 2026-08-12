"use client";

import AuthModalTrigger from "@/components/common/login-signup-modal/AuthModalTrigger";
import { useHasMounted } from "@/hooks/useHasMounted";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const MobileAuthIcon = () => {
  const hasMounted = useHasMounted();
  const { isAuthenticated, isLoading } = useAuth();

  if (!hasMounted || isLoading) {
    return (
      <AuthModalTrigger as="a" className="d-inline-block">
        <span className="icon fz18 far fa-user-circle" />
      </AuthModalTrigger>
    );
  }

  if (isAuthenticated) {
    return (
      <Link href={AUTHENTICATED_HOME} className="d-inline-block">
        <span className="icon fz18 far fa-user-circle" />
      </Link>
    );
  }

  return (
    <AuthModalTrigger as="a" className="d-inline-block">
      <span className="icon fz18 far fa-user-circle" />
    </AuthModalTrigger>
  );
};

export default MobileAuthIcon;
