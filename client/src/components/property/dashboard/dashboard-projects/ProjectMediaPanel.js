"use client";

import { buytlyApi } from "@/api/generated";
import AsyncActionOverlay from "@/components/common/AsyncActionOverlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PropertyPhotoGallery from "@/components/property/dashboard/dashboard-add-property/PropertyPhotoGallery";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { getApiError } from "@/lib/auth/getApiError";
import { projectMediaDeleteConfirmation } from "@/lib/confirmations";
import {
  mediaToSavedGalleryItems,
  moveGalleryItem,
  sortPropertyImages,
} from "@/lib/properties/propertyPhotoGallery";
import { notifyError, notifySuccess } from "@/lib/toast";
import { useCallback, useEffect, useMemo, useState } from "react";

function isVideoFile(file) {
  return file.type.startsWith("video/");
}

function projectVideoFromMedia(media = []) {
  return media.find((m) => m.type === "video") || null;
}

export default function ProjectMediaPanel({
  projectId,
  media = [],
  onUpdated,
  disabled = false,
}) {
  const [photoGallery, setPhotoGallery] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [reordering, setReordering] = useState(false);

  const { requestConfirm, dialogProps, isLocked, overlayMessage } =
    useConfirmAction({ overlay: true });

  const video = useMemo(() => projectVideoFromMedia(media), [media]);

  useEffect(() => {
    setPhotoGallery(
      mediaToSavedGalleryItems(media, { label: "Project photo" }),
    );
  }, [media]);

  const refresh = useCallback(async () => {
    if (onUpdated) await onUpdated();
  }, [onUpdated]);

  const persistPhotoOrder = useCallback(
    async (nextGallery) => {
      const imageIds = nextGallery.map((item) => item.id);
      if (!imageIds.length) return;

      setReordering(true);
      try {
        await buytlyApi.reorderProjectMedia(projectId, { imageIds });
        await refresh();
      } catch (error) {
        notifyError(getApiError(error));
        await refresh();
      } finally {
        setReordering(false);
      }
    },
    [projectId, refresh],
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

  const uploadFiles = async (
    files,
    { imagesOnly = false, videoOnly = false },
  ) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    setUploadProgress({ done: 0, total: list.length });

    try {
      for (let i = 0; i < list.length; i += 1) {
        const file = list[i];
        if (imagesOnly && isVideoFile(file)) {
          notifyError(
            `Skipped ${file.name}: use the video section for videos.`,
          );
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

        await buytlyApi.uploadProjectMedia(projectId, { media: file });
        setUploadProgress({ done: i + 1, total: list.length });
      }

      notifySuccess(
        list.length === 1 ? "Media uploaded" : `${list.length} files uploaded`,
      );
      await refresh();
    } catch (error) {
      notifyError(getApiError(error));
    } finally {
      setUploadProgress(null);
    }
  };

  const handlePhotoSelect = (event) => {
    const files = event.target.files;
    event.target.value = "";
    uploadFiles(files, { imagesOnly: true });
  };

  const handleVideoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    uploadFiles([file], { videoOnly: true });
  };

  const promptDeletePhoto = (item, index) => {
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

  const panelBusy =
    disabled || isLocked || Boolean(uploadProgress) || reordering;
  const sortedImages = sortPropertyImages(media);

  return (
    <div className="project-edit-section project-edit-media overflow-hidden position-relative">
      <ConfirmDialog {...dialogProps} />
      <AsyncActionOverlay
        active={Boolean(overlayMessage)}
        message={overlayMessage}
      />

      <h4 className="project-edit-section__title mb5">Project gallery</h4>
      <p className="project-edit-section__lede mb25">
        Marketing photos and video for the project page and discovery cards. The
        first photo is the cover — use the star or arrows to reorder (same as
        unit listings).
      </p>

      <div className="col-sm-12 px-0">
        <h5 className="fz17 mb15">Photos</h5>
        <div className="mb20">
          <label className="heading-color ff-heading fw600 mb10">
            Upload photos
          </label>
          <input
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
            disabled={panelBusy}
            onRemove={promptDeletePhoto}
            onSetCover={setGalleryCover}
            onMoveLeft={moveGalleryPhotoLeft}
            onMoveRight={moveGalleryPhotoRight}
          />
        ) : (
          <div className="upload-img position-relative overflow-hidden bdrs12 text-center mb30 px-2 py-4 bgc-f7">
            <div className="icon mb15">
              <span className="flaticon-upload" />
            </div>
            <p className="text mb0">No project photos yet.</p>
          </div>
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
                <video
                  className="w-100 bdrs12 cover"
                  src={video.url}
                  controls
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
