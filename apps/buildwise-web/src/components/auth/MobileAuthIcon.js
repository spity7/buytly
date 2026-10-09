"use client";

import AccountHeaderAvatar, {
  AccountHeaderAvatarLoading,
  AccountHeaderAvatarPlaceholder,
  getAccountLabel,
} from "@/components/auth/AccountHeaderAvatar";
import AuthModalTrigger from "@/components/common/login-signup-modal/AuthModalTrigger";
import { useHasMounted } from "@/hooks/useHasMounted";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const MobileAuthIcon = () => {
  const hasMounted = useHasMounted();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (!hasMounted || isLoading) {
    return (
      <span
        className="mobile-auth-icon"
        aria-busy="true"
        aria-label="Loading account"
      >
        <AccountHeaderAvatarLoading />
      </span>
    );
  }

  if (isAuthenticated) {
    const accountLabel = getAccountLabel(user);

    return (
      <Link
        href={AUTHENTICATED_HOME}
        className="mobile-auth-icon header-auth-link--account"
        aria-label={`${accountLabel}, go to dashboard`}
      >
        <AccountHeaderAvatar user={user} />
      </Link>
    );
  }

  return (
    <AuthModalTrigger
      as="a"
      className="mobile-auth-icon"
      aria-label="Login or register"
    >
      <AccountHeaderAvatarPlaceholder />
    </AuthModalTrigger>
  );
};

export default MobileAuthIcon;
