"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { submitContactInquiry } from "@/lib/contact/submitContactInquiry";
import {
  getPlatformSupportEmail,
  getPlatformSupportMailtoUrl,
} from "@/data/platformContact";
import { useState } from "react";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

export default function Form() {
  const { run, isBusy } = useAsyncAction();
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldError, setFieldError] = useState("");

  const supportEmail = getPlatformSupportEmail();

  const handleChange = (field) => (event) => {
    setFieldError("");
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldError("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!firstName || !lastName || !email || !message) {
      setFieldError("Please fill in all fields.");
      return;
    }

    if (message.length < 10) {
      setFieldError("Message must be at least 10 characters.");
      return;
    }

    run({
      message: "Sending your message…",
      successMessage:
        "Thank you — we received your message and will reply soon.",
      task: async () => {
        await submitContactInquiry({
          firstName,
          lastName,
          email,
          message,
        });
        setForm(INITIAL_FORM);
      },
    });
  };

  return (
    <form className="form-style1" onSubmit={handleSubmit} noValidate>
      <div className="row">
        <div className="col-lg-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Your first name"
              value={form.firstName}
              onChange={handleChange("firstName")}
              required
              disabled={isBusy}
            />
          </div>
        </div>

        <div className="col-lg-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Your last name"
              value={form.lastName}
              onChange={handleChange("lastName")}
              required
              disabled={isBusy}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange("email")}
              required
              disabled={isBusy}
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="mb10">
            <label className="heading-color ff-heading fw600 mb10">
              Message
            </label>
            <textarea
              cols={30}
              rows={4}
              placeholder="How can we help you?"
              value={form.message}
              onChange={handleChange("message")}
              required
              disabled={isBusy}
            />
          </div>
        </div>

        {fieldError ? (
          <div className="col-md-12">
            <p className="text-danger mb10" role="alert">
              {fieldError}
            </p>
          </div>
        ) : null}

        {supportEmail ? (
          <div className="col-md-12">
            <p className="text mb15">
              Prefer email? Write to{" "}
              <a href={getPlatformSupportMailtoUrl()}>{supportEmail}</a>{" "}
              directly.
            </p>
          </div>
        ) : null}

        <div className="col-md-12">
          <div className="d-grid">
            <button type="submit" className="ud-btn btn-thm" disabled={isBusy}>
              Submit
              <i className="fal fa-arrow-right-long" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
