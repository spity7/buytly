"use client";

import PasswordInput from "@/components/common/PasswordInput";
import { buytlyApi } from "@/api/generated";
import { getApiError } from "@/lib/auth/getApiError";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DeleteAccountForm = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isGoogleAccount = user?.authProvider === "google";
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (confirmText !== "DELETE") {
      notifyError('Type "DELETE" to confirm account deletion.');
      return;
    }

    setIsSubmitting(true);

    try {
      await buytlyApi.deleteCurrentUser(isGoogleAccount ? {} : { password });
      notifySuccess("Your account has been deleted.");
      await logout();
      router.replace("/?auth=signin");
    } catch (err) {
      notifyError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="form-style1 delete-account-form" onSubmit={handleSubmit}>
      <p className="text mb20">
        Deleting your account is permanent. Your profile will be deactivated and
        you will be signed out on all devices.
      </p>

      <div className="row">
        {!isGoogleAccount ? (
          <div className="col-sm-6 col-xl-4">
            <div className="mb20">
              <label className="heading-color ff-heading fw600 mb10">
                Current password
              </label>
              <PasswordInput
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>
        ) : null}

        <div className="col-sm-6 col-xl-4">
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="DELETE"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div className="col-md-12">
          <div className="dashboard-form-actions">
            <button
              type="submit"
              className="ud-btn btn-white2 delete-account-form__submit"
              disabled={
                isSubmitting ||
                confirmText !== "DELETE" ||
                (!isGoogleAccount && !password)
              }
            >
              {isSubmitting ? "Deleting account..." : "Delete my account"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DeleteAccountForm;
