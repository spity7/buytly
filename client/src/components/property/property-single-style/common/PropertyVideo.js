"use client";

import ModalVideo from "@/components/common/ModalVideo";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { useMemo, useState } from "react";

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

const PropertyVideo = () => {
  const { property } = usePropertySingle();
  const [isOpen, setOpen] = useState(false);

  const videoMedia = useMemo(
    () => property?.media?.find((item) => item.type === "video" && item.url),
    [property?.media],
  );

  const posterImage = useMemo(
    () =>
      property?.media?.find((item) => item.type === "image" && item.url)?.url,
    [property?.media],
  );

  if (!videoMedia?.url) return null;

  const youtubeId = extractYouTubeId(videoMedia.url);

  return (
    <>
      {youtubeId && (
        <ModalVideo setIsOpen={setOpen} isOpen={isOpen} videoId={youtubeId} />
      )}
      <div className="col-md-12">
        {youtubeId ? (
          <div
            className="property_video bdrs12 w-100"
            style={
              posterImage
                ? {
                    backgroundImage: `url(${posterImage})`,
                  }
                : undefined
            }
          >
            <button
              className="video_popup_btn mx-auto popup-img"
              onClick={() => setOpen(true)}
              style={{ border: "none", background: "transparent" }}
              type="button"
              aria-label="Play property video"
            >
              <span className="flaticon-play" />
            </button>
          </div>
        ) : (
          <video
            className="w-100 bdrs12"
            src={videoMedia.url}
            controls
            poster={posterImage}
            style={{ maxHeight: 480 }}
          />
        )}
      </div>
    </>
  );
};

export default PropertyVideo;
