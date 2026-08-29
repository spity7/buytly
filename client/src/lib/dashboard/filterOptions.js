export const MY_PROPERTY_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
];

export const ADMIN_PROPERTY_STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "archived", label: "Archived" },
];

export const LISTING_TYPE_FILTERS = [
  { value: "", label: "All listing types" },
  { value: "sale", label: "For sale" },
  { value: "rent", label: "For rent" },
];

export const PROPERTY_TYPE_FILTERS = [
  { value: "", label: "All property types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "duplex", label: "Duplex" },
  { value: "studio", label: "Studio" },
];

export const PROPERTY_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
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
  { value: "rent", label: "Rental" },
];

export function parseSortValue(value) {
  const [sortBy, sortOrder] = (value || "createdAt:desc").split(":");
  return { sortBy, sortOrder };
}
