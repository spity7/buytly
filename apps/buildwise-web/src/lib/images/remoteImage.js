export function isGcsSignedUrl(src) {
  return (
    typeof src === "string" &&
    (src.includes("storage.googleapis.com") || src.includes("X-Goog-Signature"))
  );
}

/** Props to spread on next/image for signed GCS URLs (skip optimizer). */
export function remoteImageProps(src) {
  return isGcsSignedUrl(src) ? { unoptimized: true } : {};
}
