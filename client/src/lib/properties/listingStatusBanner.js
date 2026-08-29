const LISTING_TYPE_LABELS = {
  sale: "For sale",
  rent: "For rent",
};

const PROPERTY_TYPE_LABELS = {
  apartment: "Apartment",
  villa: "Villa",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  duplex: "Duplex",
  studio: "Studio",
};

export function formatListingDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatMediaCount(count) {
  if (!count) return "No media uploaded";
  return count === 1 ? "1 file uploaded" : `${count} files uploaded`;
}

function getListingTypeLabel(listingType) {
  return LISTING_TYPE_LABELS[listingType] || listingType || "—";
}

function getPropertyTypeLabel(type) {
  return PROPERTY_TYPE_LABELS[type] || type || "—";
}

export function getListingStatusBannerContent({
  status,
  createdAt,
  updatedAt,
  viewCount = 0,
  listingType,
  type,
  mediaCount = 0,
  isAdmin = false,
}) {
  const listingLabel = getListingTypeLabel(listingType);
  const propertyLabel = getPropertyTypeLabel(type);
  const mediaLabel = formatMediaCount(mediaCount);
  const commonMeta = [
    { label: "Listing", value: `${listingLabel} · ${propertyLabel}` },
    { label: "Media", value: mediaLabel },
  ];

  switch (status) {
    case "pending":
      return {
        message: isAdmin
          ? "This listing is hidden from the public until it is approved."
          : "Hidden from search and listing pages until approved. Only you and admins can view it.",
        meta: [
          {
            label: "Submitted",
            value: formatListingDate(updatedAt || createdAt),
          },
          ...commonMeta,
        ],
        nextStep: isAdmin
          ? 'Use "Approve & publish" to make this listing live immediately, or "Return to draft" to send it back to the owner.'
          : "We'll notify you by email when an admin approves your listing or returns it for edits.",
      };
    case "draft":
      return {
        message:
          "This listing is saved as a draft and is not visible to buyers yet.",
        meta: [
          { label: "Created", value: formatListingDate(createdAt) },
          ...commonMeta,
        ],
        nextStep:
          'Complete the required fields, then click "Submit for review" when you are ready to publish.',
      };
    case "active":
      return {
        message: isAdmin
          ? "This listing is live on the marketplace."
          : "Your listing is live and visible to the public.",
        meta: [
          {
            label: "Published",
            value: formatListingDate(updatedAt || createdAt),
          },
          {
            label: "Views",
            value: viewCount.toLocaleString(),
          },
          ...commonMeta,
        ],
        nextStep: isAdmin
          ? "Changes save immediately without re-review. Use Set as draft to unpublish."
          : 'Use "Save changes" for minor edits. Changing price, description, location, or media on a live listing sends it back for review.',
      };
    case "sold":
      return {
        message: isAdmin
          ? "This property has been marked as sold and is hidden from active search."
          : "This property has been marked as sold and is no longer available.",
        meta: [
          { label: "Closed", value: formatListingDate(updatedAt || createdAt) },
          { label: "Total views", value: viewCount.toLocaleString() },
          { label: "Listing", value: listingLabel },
        ],
        nextStep: isAdmin
          ? "You can still edit listing details as an admin."
          : "This listing is closed and can no longer be edited.",
      };
    case "rented":
      return {
        message: isAdmin
          ? "This property has been marked as rented and is hidden from active search."
          : "This property has been marked as rented and is no longer available.",
        meta: [
          { label: "Closed", value: formatListingDate(updatedAt || createdAt) },
          { label: "Total views", value: viewCount.toLocaleString() },
          { label: "Listing", value: listingLabel },
        ],
        nextStep: isAdmin
          ? "You can still edit listing details as an admin."
          : "This listing is closed and can no longer be edited.",
      };
    case "archived":
      return {
        message: isAdmin
          ? "This listing is archived and hidden from public search."
          : "This listing has been archived and is hidden from public search.",
        meta: [
          {
            label: "Archived",
            value: formatListingDate(updatedAt || createdAt),
          },
          { label: "Total views", value: viewCount.toLocaleString() },
          ...commonMeta,
        ],
        nextStep: isAdmin
          ? 'Use "Restore & publish" to make it live again, or "Set as draft" to keep it offline for edits.'
          : "This listing is closed and can no longer be edited.",
      };
    default:
      return {
        message: null,
        meta: commonMeta,
        nextStep: null,
      };
  }
}
