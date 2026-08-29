"use client";

import PasswordInput from "@/components/common/PasswordInput";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { buytlyApi } from "@/api/generated";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { notifyError } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DeleteAccountForm = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isGoogleAccount = user?.authProvider === "google";
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const { requestConfirm, isLocked, overlayMessage, dialogProps } =
    useConfirmAction({ overlay: true });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (confirmText !== "DELETE") {
      notifyError('Type "DELETE" to confirm account deletion.');
      return;
    }

    requestConfirm({
      title: "Delete your account?",
      message:
        "This is permanent. Your profile will be deactivated and you will be signed out on all devices.",
      confirmLabel: "Delete my account",
      confirmVariant: "danger",
      confirmingLabel: "Deleting account...",
      action: {
        message: "Deleting account...",
        successMessage: "Your account has been deleted",
        task: async () => {
          await buytlyApi.deleteCurrentUser(
            isGoogleAccount ? {} : { password },
          );
          await logout();
          router.replace("/?auth=signin");
        },
      },
    });
  };

  return (
    <form className="form-style1 delete-account-form" onSubmit={handleSubmit}>
      <p className="text mb20">
        Deleting your account is permanent. Your profile will be deactivated and
        you will be signed out on all devices.
      </p>

      <fieldset
        disabled={isLocked}
        style={{ border: "none", padding: 0, margin: 0 }}
      >
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
                  isLocked ||
                  confirmText !== "DELETE" ||
                  (!isGoogleAccount && !password)
                }
              >
                {isLocked ? "Deleting account..." : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      </fieldset>

      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay message={overlayMessage} />
    </form>
  );
};

export default DeleteAccountForm;
