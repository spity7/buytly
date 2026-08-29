"use client";

import AccountSummary from "@/components/property/dashboard/dashboard-profile/AccountSummary";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import { buytlyApi } from "@/api/generated";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { isExternalImageSrc } from "@/lib/images/isExternalImageSrc";
import { notifyError } from "@/lib/toast";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const DEFAULT_AVATAR = "/images/listings/profile-1.jpg";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ProfileBox = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const { run, isBusy, overlayMessage } = useAsyncAction({ overlay: true });

  const avatarUrl = previewUrl || user?.avatar?.url || DEFAULT_AVATAR;
  const hasCustomAvatar = Boolean(user?.avatar?.gcsKey || previewUrl);

  useEffect(() => {
    if (!user) {
      setPreviewUrl(null);
      return;
    }

    if (user.avatar?.url) {
      setPreviewUrl(null);
    }
  }, [user?.id, user?.avatar?.url, user?.avatar?.gcsKey]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      notifyError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      notifyError("Image must be 10 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      await run({
        message: "Uploading profile photo...",
        successMessage: "Profile photo updated",
        task: async () => {
          const response = await buytlyApi.uploadUserAvatar({ avatar: file });
          const uploadedUrl = response.data?.avatar?.url;
          const updatedUser = await refreshUser();
          const serverUrl = updatedUser?.avatar?.url || uploadedUrl;

          if (serverUrl) {
            setPreviewUrl(serverUrl);
          }
        },
      });
    } catch {
      setPreviewUrl(null);
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleDelete = async () => {
    try {
      await run({
        message: "Removing profile photo...",
        successMessage: "Profile photo removed",
        task: async () => {
          await buytlyApi.deleteUserAvatar();
          setPreviewUrl(null);
          await refreshUser();
          setShowRemoveConfirm(false);
        },
      });
    } catch {
      // Toast handled by useAsyncAction
    }
  };

  if (isLoading || !user) {
    return (
      <div className="profile-box profile-box--loading position-relative d-md-flex align-items-end mb50">
        <div className="profile-form-skeleton__avatar mb20-sm" />
        <div className="profile-content ml30 ml0-sm">
          <div className="profile-form-skeleton__input profile-form-skeleton__input--button mb15" />
          <div className="profile-form-skeleton__label" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-box position-relative d-md-flex align-items-end mb50">
      <div className="profile-img new position-relative overflow-hidden bdrs12 mb20-sm">
        <Image
          width={240}
          height={220}
          className="w-100 cover h-100"
          src={avatarUrl}
          alt="Profile photo"
          unoptimized={isExternalImageSrc(avatarUrl)}
        />

        {hasCustomAvatar ? (
          <button
            type="button"
            className="tag-del"
            style={{ border: "none" }}
            data-tooltip-id="profile_del"
            onClick={() => setShowRemoveConfirm(true)}
            disabled={isBusy}
            aria-label="Remove profile photo"
          >
            <span className="fas fa-trash-can" />
          </button>
        ) : null}

        <ReactTooltip id="profile_del" place="right" content="Remove photo" />
      </div>

      <div className="profile-content ml30 ml0-sm">
        <AccountSummary />
        <label className="upload-label pointer">
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleUpload}
            style={{ display: "none" }}
            disabled={isBusy}
          />
          <div className="ud-btn btn-white2 mb15">
            {hasCustomAvatar ? "Change photo" : "Upload photo"}
            <i className="fal fa-arrow-right-long" />
          </div>
        </label>
        <p className="text mb0">JPEG, PNG, or WebP. Maximum file size 10 MB.</p>
      </div>

      <ConfirmDialog
        open={showRemoveConfirm}
        title="Remove profile photo?"
        message="Your current profile photo will be deleted. You can upload a new one anytime."
        confirmLabel="Remove photo"
        cancelLabel="Cancel"
        confirmVariant="danger"
        isConfirming={isBusy}
        confirmingLabel="Removing..."
        onClose={() => {
          if (!isBusy) {
            setShowRemoveConfirm(false);
          }
        }}
        onConfirm={handleDelete}
      />

      <AsyncActionOverlay message={overlayMessage} />
    </div>
  );
};

export default ProfileBox;
