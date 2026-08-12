"use client";

import AuthTabSwitch from "./AuthTabSwitch";
import GoogleIcon from "./GoogleIcon";
import PasswordInput from "@/components/common/PasswordInput";
import PhoneFields from "@/components/common/PhoneFields";
import { closeAuthModal } from "./authModal";
import { getApiError, useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "agent", label: "Agent" },
];

const SignUp = () => {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneCountryCode: "",
    phoneNumber: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const trimmedPhone = form.phoneNumber.trim();

    if (trimmedPhone && !form.phoneCountryCode) {
      setError("Please select a country code for your phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        role: form.role,
        ...(trimmedPhone
          ? {
              phoneCountryCode: form.phoneCountryCode,
              phoneNumber: trimmedPhone,
            }
          : {}),
      });
      setSuccess("Account created! Check your email to verify your address.");
      await closeAuthModal();
      router.push("/dashboard-home");
    } catch (err) {
      setError(getApiError(err, "Registration failed. Please try again."));
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
      {success ? (
        <div className="alert alert-success mb20" role="alert">
          {success}
        </div>
      ) : null}

      <div className="row">
        <div className="col-sm-6 mb25">
          <label className="form-label fw600 dark-color">First Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="First name"
            value={form.firstName}
            onChange={updateField("firstName")}
            maxLength={50}
            autoComplete="given-name"
          />
        </div>
        <div className="col-sm-6 mb25">
          <label className="form-label fw600 dark-color">Last Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Last name"
            value={form.lastName}
            onChange={updateField("lastName")}
            maxLength={50}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="mb25">
        <label className="form-label fw600 dark-color">Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter Email"
          value={form.email}
          onChange={updateField("email")}
          required
          autoComplete="email"
        />
      </div>

      <div className="mb25">
        <PhoneFields
          idPrefix="signup-phone"
          countryCode={form.phoneCountryCode}
          phoneNumber={form.phoneNumber}
          onCountryCodeChange={(value) => {
            setForm((current) => ({ ...current, phoneCountryCode: value }));
          }}
          onPhoneNumberChange={(value) => {
            setForm((current) => ({
              ...current,
              phoneNumber: value,
              phoneCountryCode: value ? current.phoneCountryCode : "",
            }));
          }}
          disabled={isSubmitting}
        />
        <p className="text fz13 mt5 mb0">
          Optional. You can add this later in My Profile.
        </p>
      </div>

      <div className="mb20">
        <label className="form-label fw600 dark-color">Password</label>
        <PasswordInput
          placeholder="Enter Password (min 8 characters)"
          value={form.password}
          onChange={updateField("password")}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="mb20">
        <label className="form-label fw600 dark-color">Confirm Password</label>
        <PasswordInput
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="mb20">
        <label className="form-label fw600 dark-color">I am a</label>
        <select
          className="form-select"
          value={form.role}
          onChange={updateField("role")}
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      <div className="d-grid mb20">
        <button
          className="ud-btn btn-thm"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}{" "}
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
        Already Have an Account?{" "}
        <AuthTabSwitch
          tab="signin"
          className="btn btn-link dark-color fw600 p-0 border-0 align-baseline"
        >
          Login
        </AuthTabSwitch>
      </p>
    </form>
  );
};

export default SignUp;
