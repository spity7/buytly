"use client";

import PasswordInput from "@/components/common/PasswordInput";
import DashboardFormSubmit from "@/components/property/dashboard/dashboard-profile/DashboardFormSubmit";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useMemo, useState } from "react";

const ChangePasswordForm = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(
    () => Boolean(currentPassword || newPassword || confirmNewPassword),
    [currentPassword, newPassword, confirmNewPassword],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      notifyError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      notifyError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await buytlyApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      notifySuccess(response.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      notifyError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.authProvider === "google") {
    return (
      <p className="text mb0">
        You signed in with Google. Password changes are managed through your
        Google account.
      </p>
    );
  }

  return (
    <form className="form-style1" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Current password
            </label>
            <PasswordInput
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              New password
            </label>
            <PasswordInput
              className="form-control"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Confirm new password
            </label>
            <PasswordInput
              className="form-control"
              placeholder="Repeat new password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="col-md-12">
          <DashboardFormSubmit
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            idleLabel="Change password"
            submittingLabel="Updating..."
          />
        </div>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
