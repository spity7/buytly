export function isExternalImageSrc(src) {
  if (typeof src !== "string") {
    return false;
  }

  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("blob:")
  );
}
