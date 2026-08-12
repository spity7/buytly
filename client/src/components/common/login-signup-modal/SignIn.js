"use client";

import AuthTabSwitch from "./AuthTabSwitch";
import GoogleIcon from "./GoogleIcon";
import PasswordInput from "@/components/common/PasswordInput";
import { closeAuthModal } from "./authModal";
import { getApiError, useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      await closeAuthModal();
      router.push("/dashboard-home");
    } catch (err) {
      setError(getApiError(err, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      {error ? (
        <div className="alert alert-danger mb20" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mb25">
        <label className="form-label fw600 dark-color">Email</label>
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

      <div className="mb15">
        <label className="form-label fw600 dark-color">Password</label>
        <PasswordInput
          placeholder="Enter Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb10">
        <label className="custom_checkbox fz14 ff-heading">
          Remember me
          <input type="checkbox" defaultChecked />
          <span className="checkmark" />
        </label>
        <Link
          className="fz14 ff-heading"
          href="/forgot-password"
          onClick={() => {
            closeAuthModal();
          }}
        >
          Lost your password?
        </Link>
      </div>

      <div className="d-grid mb20">
        <button
          className="ud-btn btn-thm"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}{" "}
          {!isSubmitting ? <i className="fal fa-arrow-right-long" /> : null}
        </button>
      </div>

      <div className="hr_content mb20">
        <hr />
        <span className="hr_top_text">OR</span>
      </div>

      <div className="d-grid mb20">
        <button
          className="ud-btn btn-google"
          type="button"
          disabled
          title="Coming soon"
        >
          <GoogleIcon className="google-icon" /> Continue with Google
        </button>
      </div>
      <p className="dark-color text-center mb0 mt10">
        Not signed up?{" "}
        <AuthTabSwitch
          tab="signup"
          className="btn btn-link dark-color fw600 p-0 border-0 align-baseline"
        >
          Create an account.
        </AuthTabSwitch>
      </p>
    </form>
  );
};

export default SignIn;
