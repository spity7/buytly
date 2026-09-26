"use client";

import { buytlyApi } from "@/api/generated";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import VideoFilePlayer from "@/components/common/VideoFilePlayer";
import PropertyPhotoGallery from "@/components/property/dashboard/dashboard-add-property/PropertyPhotoGallery";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getApiError } from "@/lib/auth/getApiError";
import { projectMediaDeleteConfirmation } from "@/lib/confirmations";
import {
  createPendingGalleryItem,
  getSavedMediaFingerprint,
  mediaToSavedGalleryItems,
  moveGalleryItem,
  sortPropertyImages,
} from "@/lib/properties/propertyPhotoGallery";
import { notifyError } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMPTY_MEDIA = [];
const PHOTO_INPUT_ID = "project-photo-upload";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/avif",
]);

function isVideoFile(file) {
  return (file.type || "").startsWith("video/");
}

function isAllowedProjectImage(file) {
  if (isVideoFile(file)) return false;
  if (file.type && file.type.startsWith("image/")) return true;
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "heic",
    "heif",
    "bmp",
    "avif",
  ].includes(ext || "");
}

function uploadedImageToGalleryItem(item, index) {
  return {
    type: "saved",
    id: item._id || item.id,
    url: item.url,
    name: item.gcsKey?.split("/").pop() || `Project photo ${index + 1}`,
    media: item,
  };
}

function projectVideoFromMedia(media = []) {
  return media.find((m) => m.type === "video") || null;
}

function unwrapUploadedMedia(response) {
  if (response?.data && typeof response.data === "object") {
    return response.data;
  }
  return response;
}

function pickPhotoFiles(files) {
  const accepted = [];
  const rejected = [];

  for (const file of files) {
    if (isVideoFile(file)) {
      rejected.push(file.name);
      continue;
    }
    if (isAllowedProjectImage(file)) {
      accepted.push(file);
    } else {
      rejected.push(file.name);
    }
  }

  return { accepted, rejected };
}

export default function ProjectMediaPanel({
  projectId,
  media = EMPTY_MEDIA,
  onUpdated,
  disabled = false,
}) {
  const [photoGallery, setPhotoGallery] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [reordering, setReordering] = useState(false);
  const mediaRef = useRef(media);
  const isUploadingRef = useRef(false);
  mediaRef.current = media;

  const { run, isBusy: mediaActionBusy } = useAsyncAction();
  const { requestConfirm, dialogProps, isLocked } = useConfirmAction();

  const video = useMemo(() => projectVideoFromMedia(media), [media]);
  const savedMediaFingerprint = getSavedMediaFingerprint(media);

  useEffect(() => {
    if (isUploadingRef.current) {
      return;
    }

    const serverItems = mediaToSavedGalleryItems(mediaRef.current, {
      label: "Project photo",
    });
    setPhotoGallery((prev) => {
      const pending = prev.filter((item) => item.type === "pending");
      if (!pending.length) {
        return serverItems;
      }
      return [...serverItems, ...pending];
    });
  }, [savedMediaFingerprint]);

  const refresh = useCallback(async () => {
    if (onUpdated) await onUpdated();
  }, [onUpdated]);

  const persistPhotoOrder = useCallback(
    async (nextGallery) => {
      const imageIds = nextGallery
        .filter((item) => item.type === "saved")
        .map((item) => item.id);
      if (!imageIds.length) return;

      setReordering(true);
      try {
        await run({
          message: "Saving photo order...",
          showToast: false,
          task: async () => {
            await buytlyApi.reorderProjectMedia(projectId, { imageIds });
            await refresh();
          },
        });
      } catch (error) {
        notifyError(getApiError(error));
        await refresh();
      } finally {
        setReordering(false);
      }
    },
    [projectId, refresh, run],
  );

  const applyGalleryReorder = useCallback(
    (fromIndex, toIndex) => {
      setPhotoGallery((prev) => {
        const next = moveGalleryItem(prev, fromIndex, toIndex);
        persistPhotoOrder(next);
        return next;
      });
    },
    [persistPhotoOrder],
  );

  const setGalleryCover = useCallback(
    (index) => applyGalleryReorder(index, 0),
    [applyGalleryReorder],
  );

  const moveGalleryPhotoLeft = useCallback(
    (index) => {
      if (index <= 0) return;
      applyGalleryReorder(index, index - 1);
    },
    [applyGalleryReorder],
  );

  const moveGalleryPhotoRight = useCallback(
    (index) => applyGalleryReorder(index, index + 1),
    [applyGalleryReorder],
  );

  const clearPendingPreviews = useCallback((items) => {
    for (const item of items) {
      if (item.type === "pending" && item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    }
  }, []);

  const uploadFiles = useCallback(
    async (files, { imagesOnly = false, videoOnly = false } = {}) => {
      const list = Array.from(files || []);
      if (!list.length) return;

      if (!projectId) {
        notifyError("Project is still loading. Try again in a moment.");
        return;
      }

      if (disabled) {
        notifyError("You cannot upload media while this project is read-only.");
        return;
      }

      isUploadingRef.current = true;
      setUploadProgress({ done: 0, total: list.length });

      try {
        await run({
          message:
            list.length === 1
              ? "Uploading media..."
              : "Uploading media files...",
          successMessage:
            list.length === 1
              ? "Media uploaded"
              : `${list.length} files uploaded`,
          task: async ({ setProgress }) => {
            let uploadedCount = 0;

            for (let i = 0; i < list.length; i += 1) {
              const file = list[i];
              if (imagesOnly && isVideoFile(file)) {
                notifyError(
                  `Skipped ${file.name}: use the video section for videos.`,
                );
                continue;
              }
              if (imagesOnly && !isAllowedProjectImage(file)) {
                notifyError(`Skipped ${file.name}: not a supported image.`);
                continue;
              }
              if (videoOnly && !isVideoFile(file)) {
                notifyError(`Skipped ${file.name}: choose a video file.`);
                continue;
              }
              if (videoOnly && video) {
                notifyError(
                  "This project already has a video. Remove it before uploading another.",
                );
                break;
              }

              if (list.length > 1) {
                setProgress(`Uploading ${i + 1} of ${list.length}...`);
              }

              const response = await buytlyApi.uploadProjectMedia(projectId, {
                media: file,
              });
              const uploaded = unwrapUploadedMedia(response);
              if (uploaded?.type === "image" && uploaded.url) {
                setPhotoGallery((prev) => [
                  ...prev,
                  uploadedImageToGalleryItem(uploaded, prev.length),
                ]);
              }
              uploadedCount += 1;
              setUploadProgress({ done: i + 1, total: list.length });
            }

            if (uploadedCount === 0) {
              throw new Error(
                imagesOnly
                  ? "No photos were uploaded. Try JPEG, PNG, or WebP."
                  : "No media was uploaded.",
              );
            }

            setPhotoGallery((prev) => {
              const next = prev.filter((item) => item.type !== "pending");
              clearPendingPreviews(prev);
              return next;
            });

            await refresh();
          },
        });
      } catch {
        setPhotoGallery((prev) => {
          clearPendingPreviews(prev);
          return prev.filter((item) => item.type !== "pending");
        });
      } finally {
        isUploadingRef.current = false;
        setUploadProgress(null);
      }
    },
    [clearPendingPreviews, disabled, projectId, refresh, run, video],
  );

  const panelBusy = disabled || isLocked || mediaActionBusy || reordering;

  const handlePhotoSelect = useCallback(
    (event) => {
      const input = event.target;
      const selectedFiles = Array.from(input?.files || []);
      input.value = "";

      if (!selectedFiles.length) {
        return;
      }

      if (panelBusy) {
        notifyError("Please wait for the current action to finish.");
        return;
      }

      let accepted = [];
      let rejected = [];

      try {
        ({ accepted, rejected } = pickPhotoFiles(selectedFiles));
      } catch (error) {
        notifyError(getApiError(error));
        return;
      }

      if (rejected.length) {
        notifyError(
          rejected.length === 1
            ? `${rejected[0]} is not a supported image. Use JPEG, PNG, or WebP.`
            : `${rejected.length} file(s) were skipped (unsupported format).`,
        );
      }

      if (!accepted.length) {
        return;
      }

      setPhotoGallery((prev) => [
        ...prev,
        ...accepted.map((file) => createPendingGalleryItem(file)),
      ]);

      void uploadFiles(accepted, { imagesOnly: true });
    },
    [panelBusy, uploadFiles],
  );

  const handleVideoSelect = (event) => {
    const input = event.target;
    const file = Array.from(input?.files || [])[0];
    input.value = "";
    if (!file) return;
    void uploadFiles([file], { videoOnly: true });
  };

  const promptDeletePhoto = (item, index) => {
    if (item.type === "pending") {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      setPhotoGallery((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    requestConfirm({
      ...projectMediaDeleteConfirmation(false),
      action: {
        message: "Removing photo...",
        successMessage: "Photo removed",
        task: async () => {
          await buytlyApi.deleteProjectMedia(projectId, item.id);
          setPhotoGallery((prev) => prev.filter((_, i) => i !== index));
          await refresh();
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const promptDeleteVideo = () => {
    const videoId = video?._id || video?.id;
    if (!videoId) return;
    requestConfirm({
      ...projectMediaDeleteConfirmation(true),
      action: {
        message: "Removing video...",
        successMessage: "Video removed",
        task: async () => {
          await buytlyApi.deleteProjectMedia(projectId, videoId);
          await refresh();
        },
        onError: (error) => notifyError(getApiError(error)),
      },
    });
  };

  const sortedImages = sortPropertyImages(media);

  return (
    <div className="project-edit-section project-edit-media overflow-hidden position-relative">
      <ConfirmDialog {...dialogProps} />

      <h4 className="project-edit-section__title mb5">Project gallery</h4>
      <p className="project-edit-section__lede mb25">
        Marketing photos and video for the project page and discovery cards. The
        first photo is the cover — use the star or arrows to reorder (same as
        unit listings).
      </p>

      <div className="col-sm-12 px-0">
        <h5 className="fz17 mb15">Photos</h5>
        <div className="mb20">
          <label
            className="heading-color ff-heading fw600 mb10"
            htmlFor={PHOTO_INPUT_ID}
          >
            Upload photos
          </label>
          <input
            id={PHOTO_INPUT_ID}
            type="file"
            className="form-control"
            accept="image/*"
            multiple
            disabled={panelBusy}
            onChange={handlePhotoSelect}
          />
          {uploadProgress ? (
            <p className="text mt10 mb0">
              Uploading {uploadProgress.done} of {uploadProgress.total}…
            </p>
          ) : (
            <p className="text mt10 mb0">
              JPEG or PNG recommended. You can select multiple files at once.
            </p>
          )}
        </div>

        {photoGallery.length > 0 ? (
          <PropertyPhotoGallery
            items={photoGallery}
            disabled={panelBusy || Boolean(uploadProgress)}
            onRemove={promptDeletePhoto}
            onSetCover={setGalleryCover}
            onMoveLeft={moveGalleryPhotoLeft}
            onMoveRight={moveGalleryPhotoRight}
          />
        ) : (
          <p className="text mb30">
            No project photos yet. Use the file control above to upload.
          </p>
        )}
      </div>

      <div className="col-sm-12 px-0 mt10">
        <h5 className="fz17 mb15">Video</h5>
        <div className="mb20">
          <label className="heading-color ff-heading fw600 mb10">
            Upload project video
          </label>
          <input
            type="file"
            className="form-control"
            accept="video/*"
            disabled={panelBusy || Boolean(video)}
            onChange={handleVideoSelect}
          />
          <p className="text mt10 mb0">
            One video per project. Shown on the public project page separately
            from photos.
          </p>
        </div>

        {video?.url ? (
          <div className="row profile-box position-relative d-md-flex align-items-end mb20">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="profile-img mb20 position-relative">
                <VideoFilePlayer
                  className="w-100 bdrs12 cover"
                  src={video.url}
                  style={{ maxHeight: 280, objectFit: "cover" }}
                />
                <button
                  type="button"
                  style={{ border: "none" }}
                  className="tag-del"
                  title="Delete video"
                  onClick={promptDeleteVideo}
                  disabled={panelBusy}
                  aria-label="Delete video"
                >
                  <span className="fas fa-trash-can" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {sortedImages.length > 0 || video ? (
        <p className="text fz13 mb0 text-muted">
          {sortedImages.length} photo{sortedImages.length === 1 ? "" : "s"}
          {video ? " · 1 video" : ""}
        </p>
      ) : null}
    </div>
  );
}
