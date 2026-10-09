"use client";

import ModalVideo from "@/components/common/ModalVideo";
import VideoFilePlayer from "@/components/common/VideoFilePlayer";
import {
  extractYouTubeVideoId,
  youtubeThumbnailFromUrl,
} from "@/lib/media/videoThumbnails";
import { usePropertySingle } from "@/providers/PropertySingleProvider";
import { useMemo, useState } from "react";

const PropertyVideo = () => {
  const { property } = usePropertySingle();
  const [isOpen, setOpen] = useState(false);

  const videoMedia = useMemo(
    () => property?.media?.find((item) => item.type === "video" && item.url),
    [property?.media],
  );

  if (!videoMedia?.url) return null;

  const youtubeId = extractYouTubeVideoId(videoMedia.url);
  const youtubePoster = youtubeThumbnailFromUrl(videoMedia.url);

  return (
    <>
      {youtubeId && (
        <ModalVideo setIsOpen={setOpen} isOpen={isOpen} videoId={youtubeId} />
      )}
      <div className="col-md-12">
        {youtubeId ? (
          <div
            className="property_video property_video--poster bdrs12 w-100"
            style={
              youtubePoster
                ? { backgroundImage: `url(${youtubePoster})` }
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
          <VideoFilePlayer src={videoMedia.url} style={{ maxHeight: 480 }} />
        )}
      </div>
    </>
  );
};

export default PropertyVideo;
