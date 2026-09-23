export function extractYouTubeVideoId(url) {
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

/** Official YouTube preview image for a video id (not listing cover photos). */
export function youtubeThumbnailUrl(videoId, quality = "hqdefault") {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function youtubeThumbnailFromUrl(url) {
  const id = extractYouTubeVideoId(url);
  return id ? youtubeThumbnailUrl(id) : null;
}
