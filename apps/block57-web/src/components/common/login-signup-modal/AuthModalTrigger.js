"use client";

import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { openAuthModal } from "./authModal";
import { useAuth } from "@/providers/AuthProvider";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useRouter } from "next/navigation";

const AuthModalTrigger = ({
  tab = "signin",
  as = "button",
  className,
  children,
  ...props
}) => {
  const { isAuthenticated } = useAuth();
  const hasMounted = useHasMounted();
  const router = useRouter();

  const handleClick = (event) => {
    event.preventDefault();

    if (hasMounted && isAuthenticated) {
      router.push(AUTHENTICATED_HOME);
      return;
    }

    openAuthModal(tab);
  };

  if (as === "a") {
    return (
      <a
        href="#"
        className={className}
        onClick={handleClick}
        role="button"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default AuthModalTrigger;
