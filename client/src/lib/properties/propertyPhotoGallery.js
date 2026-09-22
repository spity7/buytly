export function sortPropertyImages(media = []) {
  return media
    .filter((item) => item.type !== "video")
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function mediaToSavedGalleryItems(
  images,
  { label = "Property photo" } = {},
) {
  return sortPropertyImages(images).map((item, index) => ({
    type: "saved",
    id: item._id,
    url: item.url,
    name: item.gcsKey?.split("/").pop() || `${label} ${index + 1}`,
    media: item,
  }));
}

export function createPendingGalleryItem(file) {
  return {
    type: "pending",
    id: `pending-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    url: URL.createObjectURL(file),
    name: file.name,
  };
}

export function getSavedGalleryIds(gallery) {
  return gallery.filter((item) => item.type === "saved").map((item) => item.id);
}

export function moveGalleryItem(gallery, fromIndex, toIndex) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= gallery.length ||
    toIndex >= gallery.length ||
    fromIndex === toIndex
  ) {
    return gallery;
  }

  const next = gallery.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}
