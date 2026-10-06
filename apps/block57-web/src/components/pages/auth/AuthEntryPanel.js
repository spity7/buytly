"use client";

import SignIn from "@/components/common/login-signup-modal/SignIn";
import SignUp from "@/components/common/login-signup-modal/SignUp";
import { AuthTabSwitchContext } from "@/components/common/login-signup-modal/AuthTabSwitch";
import { BRAND_NAME } from "@/data/brandAssets";
import { buildAuthEntryUrl, parseAuthEntryParams } from "@/lib/auth/authIntent";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const TABS = [
  { id: "signin", label: "Sign In" },
  { id: "signup", label: "New Account" },
];

export function AuthEntryPanelFallback() {
  return (
    <div className="d-flex align-items-center justify-content-center py30">
      <div className="spinner-border text-thm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Sign-in / sign-up forms rendered inline (the /login/ page), driven by
 * `?auth=signin|signup`, `next`, `role` and `intent`. Uses useSearchParams, so
 * render it inside <Suspense>.
 */
const AuthEntryPanel = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { tab, role, next, intentHint } = parseAuthEntryParams(searchParams);
  const redirectTo = next ?? AUTHENTICATED_HOME;
  const initialAuthCheckedRef = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Visitors who arrive already signed in go straight to `next`. After an
  // in-page sign-in the forms navigate themselves, so only check once.
  useEffect(() => {
    if (isLoading || initialAuthCheckedRef.current) {
      return;
    }

    initialAuthCheckedRef.current = true;
    if (isAuthenticated) {
      setIsRedirecting(true);
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // Keep the tab in the URL (shareable, survives refresh) without a navigation.
  const switchTab = useCallback(
    (nextTab) => {
      window.history.replaceState(
        null,
        "",
        buildAuthEntryUrl({ tab: nextTab, next, role, intent: intentHint }),
      );
    },
    [intentHint, next, role],
  );

  if (isLoading || isRedirecting) {
    return <AuthEntryPanelFallback />;
  }

  return (
    <AuthTabSwitchContext.Provider value={switchTab}>
      <h2 className="title mb20">Welcome to {BRAND_NAME}</h2>
      <div className="navtab-style2">
        <nav>
          <div className="nav nav-tabs mb20" role="tablist">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`auth-entry-${item.id}-tab`}
                aria-controls={`auth-entry-${item.id}`}
                aria-selected={tab === item.id}
                className={`nav-link fw600${tab === item.id ? " active" : ""}`}
                onClick={() => switchTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div
          className="fz15"
          id={`auth-entry-${tab}`}
          role="tabpanel"
          aria-labelledby={`auth-entry-${tab}-tab`}
        >
          {tab === "signup" ? (
            <SignUp
              defaultRole={role || "buyer"}
              redirectTo={redirectTo}
              intentHint={intentHint || null}
            />
          ) : (
            <SignIn redirectTo={redirectTo} />
          )}
        </div>
      </div>
    </AuthTabSwitchContext.Provider>
  );
};

export default AuthEntryPanel;
