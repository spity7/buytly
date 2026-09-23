"use client";

/**
 * Uploaded listing/project video — no gallery cover poster; the browser paints
 * a frame from the video file once metadata loads.
 */
export default function VideoFilePlayer({
  src,
  className = "w-100 bdrs12",
  style,
  ...rest
}) {
  if (!src) return null;

  return (
    <video
      className={className}
      src={src}
      controls
      preload="auto"
      playsInline
      style={style}
      {...rest}
    />
  );
}
