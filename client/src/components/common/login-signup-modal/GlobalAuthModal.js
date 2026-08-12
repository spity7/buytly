"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginSignupModal from "./index";
import { AUTH_MODAL_ID, openAuthModal } from "./authModal";
import { useAuth } from "@/providers/AuthProvider";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";

export function AuthModalFromQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth !== "signin" && auth !== "signup") {
      return;
    }

    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.replace(AUTHENTICATED_HOME);
      return;
    }

    router.replace(pathname, { scroll: false });
    openAuthModal(auth);
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  return null;
}

const GlobalAuthModal = () => {
  return (
    <div className="signup-modal">
      <div
        className="modal fade"
        id={AUTH_MODAL_ID}
        tabIndex={-1}
        aria-labelledby="loginSignupModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
          <LoginSignupModal />
        </div>
      </div>
    </div>
  );
};

export default GlobalAuthModal;
