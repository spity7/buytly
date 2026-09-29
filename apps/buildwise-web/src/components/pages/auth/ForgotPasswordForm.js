"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await buytlyApi.forgotPassword({ email });
      setSuccess(
        response.message ||
          "If an account exists with that email, a reset link has been sent.",
      );
      setEmail("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
      <>
        <DefaultHeader />
        <MobileMenu />

        <section className="our-compare pt60 pb60">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 m-auto">
                <div className="log-reg-form default-box-shadow1 bdrs12 bdr1 p30 mb30-md bgc-white">
                  <h2 className="title mb20">Forgot your password?</h2>
                  <p className="text mb25">
                    Enter your email and we&apos;ll send you a link to reset
                    your password.
                  </p>

                  {error ? (
                    <div className="alert alert-danger mb20" role="alert">
                      {error}
                    </div>
                  ) : null}
                  {success ? (
                    <div className="alert alert-success mb20" role="alert">
                      {success}
                    </div>
                  ) : null}

                  <form className="form-style1" onSubmit={handleSubmit}>
                    <div className="mb20">
                      <label className="form-label fw600 dark-color">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="d-grid mb15">
                      <button
                        className="ud-btn btn-thm"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send reset link"}
                      </button>
                    </div>
                    <p className="dark-color text-center mb0">
                      Remembered your password?{" "}
                      <Link href="/?auth=signin">Sign in</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </>
    </RedirectIfAuthenticated>
  );
};

export default ForgotPasswordForm;
