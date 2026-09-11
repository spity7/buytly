import { gcsService } from "./gcs.service.js";

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 10 * 1024 * 1024;

function resolvePictureUrl(pictureUrl) {
  if (!pictureUrl.includes("googleusercontent.com")) {
    return pictureUrl;
  }

  return pictureUrl.replace(/=s\d+(-c)?$/, "=s256-c");
}

export async function importAvatarFromUrl(pictureUrl) {
  const response = await fetch(resolvePictureUrl(pictureUrl), {
    signal: AbortSignal.timeout(10_000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Avatar fetch failed with status ${response.status}`);
  }

  const rawType = (response.headers.get("content-type") || "image/jpeg")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const mimeType = ALLOWED_MIMES.has(rawType) ? rawType : "image/jpeg";

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw new Error("Avatar image has invalid size");
  }

  return gcsService.uploadFile(buffer, {
    folder: "avatars",
    mimeType,
    originalName:
      mimeType === "image/png" ? "google-avatar.png" : "google-avatar.jpg",
  });
}

/**
 * Downloads the Google profile photo into GCS when the user has no avatar yet.
 * @returns {boolean} whether the user document was updated in memory
 */
export async function syncGoogleAvatarIfMissing(user, pictureUrl) {
  if (!pictureUrl || user.avatar?.gcsKey) {
    return false;
  }

  try {
    user.avatar = await importAvatarFromUrl(pictureUrl);
    return true;
  } catch (err) {
    console.error("Google avatar sync failed:", err.message);
    return false;
  }
}
