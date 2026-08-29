"use client";

import GoogleIcon from "@/components/common/login-signup-modal/GoogleIcon";
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthButton = ({
  onCredential,
  disabled = false,
  error = "",
  label = "Continue with Google",
}) => {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <div className="alert alert-warning mb0" role="alert">
        Google sign-in is not configured.
      </div>
    );
  }

  return (
    <div className={`google-auth-button${disabled ? " is-disabled" : ""}`}>
      {error ? (
        <div className="alert alert-danger mb15" role="alert">
          {error}
        </div>
      ) : null}

      <div
        className="google-auth-button__btn ud-btn btn-google"
        aria-busy={disabled}
      >
        <GoogleIcon className="google-auth-button__icon" />
        <span className="google-auth-button__label">
          {disabled ? "Signing in with Google..." : label}
        </span>

        <div className="google-auth-button__overlay" aria-hidden="true">
          <GoogleLogin
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
            width="400"
            locale="en"
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthButton;
