"use client";

import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";

const EmailVerificationBadge = () => {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  const handleResend = async () => {
    setIsSubmitting(true);

    try {
      const response = await buytlyApi.resendVerification({
        email: user.email,
      });
      notifySuccess(
        response.message ||
          "If your account is unverified, a new verification email has been sent.",
      );
      await refreshUser();
    } catch (err) {
      notifyError(getApiError(err));
    } finally {
      setIsSubmitting(false);
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
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Resend email"}
      </button>
    </div>
  );
};

export default EmailVerificationBadge;
