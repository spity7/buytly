"use client";

import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";

const EmailVerificationBanner = () => {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { run, isBusy } = useAsyncAction();

  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResend = async () => {
    setMessage("");
    setError("");

    try {
      const response = await run({
        message: "Sending verification email...",
        showToast: false,
        task: async () => {
          const result = await buytlyApi.resendVerification({
            email: user.email,
          });
          await refreshUser();
          return result;
        },
      });
      setMessage(
        response?.message ||
          "If your account is unverified, a new verification email has been sent.",
      );
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div className="email-verification-banner mb20">
      <div className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 mb0 bdrs12">
        <span>Please verify your email address to secure your account.</span>
        <button
          type="button"
          className="ud-btn btn-thm btn-sm"
          onClick={handleResend}
          disabled={isBusy}
        >
          {isBusy ? "Sending..." : "Resend verification email"}
        </button>
      </div>
      {message ? <p className="text-success fz14 mt10 mb0">{message}</p> : null}
      {error ? <p className="text-danger fz14 mt10 mb0">{error}</p> : null}
    </div>
  );
};

export default EmailVerificationBanner;
