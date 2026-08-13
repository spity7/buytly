"use client";

import { openAuthModal } from "@/components/common/login-signup-modal/authModal";
import {
  ADD_PROPERTY_PATH,
  buildListingSignupIntent,
  setAuthIntent,
} from "@/lib/auth/authIntent";
import { canManageListings } from "@/lib/auth/roles";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

const defaultChildren = (
  <>
    Add Property
    <i className="fal fa-arrow-right-long" />
  </>
);

const AddPropertyLink = ({ className, children = defaultChildren }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasMounted = useHasMounted();

  if (
    hasMounted &&
    !isLoading &&
    isAuthenticated &&
    !canManageListings(user?.role)
  ) {
    return null;
  }

  if (
    hasMounted &&
    !isLoading &&
    isAuthenticated &&
    canManageListings(user?.role)
  ) {
    return (
      <Link className={className} href={ADD_PROPERTY_PATH}>
        {children}
      </Link>
    );
  }

  const handleClick = (event) => {
    event.preventDefault();
    setAuthIntent(buildListingSignupIntent());
    openAuthModal("signup");
  };

  return (
    <a href="#" className={className} onClick={handleClick} role="button">
      {children}
    </a>
  );
};

export default AddPropertyLink;
