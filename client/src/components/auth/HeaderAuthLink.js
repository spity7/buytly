"use client";

import AccountHeaderAvatar, {
  AccountHeaderAvatarLoading,
  getAccountLabel,
} from "@/components/auth/AccountHeaderAvatar";
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
        <AccountHeaderAvatarLoading />
      </span>
    );
  }

  if (isAuthenticated) {
    const accountLabel = getAccountLabel(user);

    return (
      <Link
        href="/dashboard-home"
        className={`${className} header-auth-link--account`}
        aria-label={`${accountLabel}, go to dashboard`}
      >
        <AccountHeaderAvatar user={user} />
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
