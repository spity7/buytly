"use client";

import GoogleIcon from "@/components/common/login-signup-modal/GoogleIcon";
import { GoogleLogin, useGoogleOAuth } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";

const GOOGLE_BUTTON_MIN_WIDTH = 200;
const GOOGLE_BUTTON_MAX_WIDTH = 400;

const clampGoogleButtonWidth = (width) =>
  Math.min(
    GOOGLE_BUTTON_MAX_WIDTH,
    Math.max(GOOGLE_BUTTON_MIN_WIDTH, Math.floor(width)),
  );

const GoogleAuthButton = ({
  onCredential,
  disabled = false,
  error = "",
  label = "Continue with Google",
}) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const buttonRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = clampGoogleButtonWidth(
        element.getBoundingClientRect().width,
      );
      setButtonWidth((current) =>
        current === nextWidth ? current : nextWidth,
      );
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!clientId) {
    return (
      <div className="alert alert-warning mb0" role="alert">
        Google sign-in is not configured.
      </div>
    );
  }

  const googleReady = scriptLoadedSuccessfully && buttonWidth > 0;
  const showScriptError = !scriptLoadedSuccessfully;

  return (
    <div className={`google-auth-button${disabled ? " is-disabled" : ""}`}>
      {error ? (
        <div className="alert alert-danger mb15" role="alert">
          {error}
        </div>
      ) : null}

      {showScriptError ? (
        <div className="alert alert-warning mb10" role="alert">
          Google sign-in could not load. Check your connection, disable ad
          blockers for this site, then refresh the page.
        </div>
      ) : null}

      <div
        ref={buttonRef}
        className="google-auth-button__btn ud-btn btn-google"
        aria-busy={disabled || !googleReady}
      >
        <GoogleIcon className="google-auth-button__icon" />
        <span className="google-auth-button__label">
          {disabled ? "Signing in with Google..." : label}
        </span>

        {googleReady ? (
          <div className="google-auth-button__overlay" aria-hidden="true">
            <GoogleLogin
              key={buttonWidth}
              onSuccess={(response) => {
                if (response.credential) {
                  onCredential(response.credential);
                }
              }}
              onError={() => onCredential(null)}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              width={buttonWidth}
              locale="en"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleAuthButton;
