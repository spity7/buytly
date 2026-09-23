export const MY_PROPERTY_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "sold", label: "Sold" },
];

export const ADMIN_PROPERTY_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archived" },
];

export const PROPERTY_TYPE_FILTERS = [
  { value: "", label: "All property types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "duplex", label: "Duplex" },
  { value: "penthouse", label: "Penthouse" },
  { value: "townhouse", label: "Townhouse" },
  { value: "office", label: "Office" },
  { value: "shop", label: "Shop" },
  { value: "building", label: "Building" },
  { value: "land", label: "Land" },
  { value: "chalet", label: "Chalet" },
];

export function getPropertyTypeLabel(value) {
  if (!value) return "—";
  const match = PROPERTY_TYPE_FILTERS.find((option) => option.value === value);
  return match?.label || String(value);
}

export const PROPERTY_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "price:asc", label: "Price from: low to high" },
  { value: "price:desc", label: "Price from: high to low" },
  { value: "viewCount:desc", label: "Most views" },
];

export const MY_PROJECT_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "sold", label: "Sold" },
];

export const PROJECT_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "title:desc", label: "Title Z–A" },
  { value: "viewCount:desc", label: "Most views" },
];

export const BOOKING_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

export const TRANSACTION_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const TRANSACTION_TYPE_FILTERS = [
  { value: "", label: "All types" },
  { value: "buy", label: "Purchase" },
];

export function parseSortValue(value) {
  const [sortBy, sortOrder] = (value || "createdAt:desc").split(":");
  return { sortBy, sortOrder };
}
