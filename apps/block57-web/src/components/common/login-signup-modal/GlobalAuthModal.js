"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginSignupModal from "./index";
import { AUTH_MODAL_ID, openAuthModal } from "./authModal";
import { useAuth } from "@/providers/AuthProvider";
import { AUTH_ENTRY_PATH, AUTHENTICATED_HOME } from "@/lib/auth/constants";
import {
  parseAuthIntentFromSearchParams,
  setAuthIntent,
} from "@/lib/auth/authIntent";
import { isSamePath } from "@/lib/url/normalizePath";

export function AuthModalFromQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // The /login/ page reads `?auth=` itself and renders the forms inline.
    if (isSamePath(pathname, AUTH_ENTRY_PATH)) {
      return;
    }

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

    const intent = parseAuthIntentFromSearchParams(searchParams);
    if (intent) {
      setAuthIntent(intent);
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
