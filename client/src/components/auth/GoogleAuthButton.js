"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRef, useEffect } from "react";

const GoogleAuthButton = ({ onCredential, disabled = false, error = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const resize = () => {
      const button = container.querySelector('[role="button"]');
      if (button) {
        button.style.width = "100%";
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return (
      <div className="alert alert-warning mb0" role="alert">
        Google sign-in is not configured.
      </div>
    );
  }

  return (
    <div className="google-auth-button">
      {error ? (
        <div className="alert alert-danger mb15" role="alert">
          {error}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className={`google-auth-button__container${disabled ? " is-disabled" : ""}`}
      >
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
  );
};

export default GoogleAuthButton;
