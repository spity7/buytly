"use client";

import { buytlyApi } from "@/api/generated";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/providers/AuthProvider";

const EmailVerificationBadge = () => {
  const { user, refreshUser } = useAuth();
  const { run, isBusy } = useAsyncAction();

  if (!user) {
    return null;
  }

  const handleResend = async () => {
    try {
      await run({
        message: "Sending verification email...",
        successMessage: (response) =>
          response?.message ||
          "If your account is unverified, a new verification email has been sent.",
        task: async () => {
          const response = await buytlyApi.resendVerification({
            email: user.email,
          });
          await refreshUser();
          return response;
        },
      });
    } catch {
      // Toast handled by useAsyncAction
    }
  };

  if (user.isEmailVerified) {
    return (
      <span
        className="profile-verification-badge profile-verification-badge--verified"
        role="status"
        aria-label="Email verified"
      >
        <span className="profile-verification-badge__icon" aria-hidden="true">
          <i className="fas fa-check" />
        </span>
        <span className="profile-verification-badge__label">
          Email verified
        </span>
      </span>
    );
  }

  return (
    <div
      className="profile-verification-badge profile-verification-badge--pending"
      role="status"
      aria-live="polite"
    >
      <span className="profile-verification-badge__icon" aria-hidden="true">
        <i className="fas fa-exclamation" />
      </span>
      <span className="profile-verification-badge__label">
        Email not verified
      </span>
      <span
        className="profile-verification-badge__divider"
        aria-hidden="true"
      />
      <button
        type="button"
        className="profile-verification-badge__action"
        onClick={handleResend}
        disabled={isBusy}
      >
        {isBusy ? "Sending..." : "Resend email"}
      </button>
    </div>
  );
};

export default EmailVerificationBadge;
