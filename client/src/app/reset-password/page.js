"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import PasswordInput from "@/components/common/PasswordInput";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link is invalid or missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await buytlyApi.resetPassword({
        token,
        password,
      });
      setSuccess(response.message || "Password reset successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <section className="our-compare pt60 pb60">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 m-auto">
              <div className="log-reg-form default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white">
                <h2 className="title mb20">Reset your password</h2>

                {!token ? (
                  <div className="alert alert-danger mb20" role="alert">
                    This reset link is invalid or has expired. Please request a
                    new one.
                  </div>
                ) : null}

                {error ? (
                  <div className="alert alert-danger mb20" role="alert">
                    {error}
                  </div>
                ) : null}
                {success ? (
                  <div className="alert alert-success mb20" role="alert">
                    {success}{" "}
                    <Link href="/?auth=signin">
                      Sign in with your new password
                    </Link>
                  </div>
                ) : null}

                <form className="form-style1" onSubmit={handleSubmit}>
                  <div className="mb20">
                    <label className="form-label fw600 dark-color">
                      New Password
                    </label>
                    <PasswordInput
                      placeholder="Enter new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      disabled={!token || Boolean(success)}
                    />
                  </div>
                  <div className="mb20">
                    <label className="form-label fw600 dark-color">
                      Confirm Password
                    </label>
                    <PasswordInput
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                      minLength={8}
                      autoComplete="new-password"
                      disabled={!token || Boolean(success)}
                    />
                  </div>
                  <div className="d-grid mb15">
                    <button
                      className="ud-btn btn-thm"
                      type="submit"
                      disabled={isSubmitting || !token || Boolean(success)}
                    >
                      {isSubmitting ? "Resetting..." : "Reset password"}
                    </button>
                  </div>
                  <p className="dark-color text-center mb0">
                    <Link href="/forgot-password">
                      Request a new reset link
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
