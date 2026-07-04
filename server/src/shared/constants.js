export const ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  AGENT: "agent",
  ADMIN: "admin",
};

export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "townhouse",
  "land",
  "commercial",
  "duplex",
  "studio",
];

export const LISTING_TYPES = ["sale", "rent"];

export const PROPERTY_STATUSES = [
  "draft",
  "pending",
  "active",
  "sold",
  "rented",
  "archived",
];

export const BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
];

export const TRANSACTION_STATUSES = [
  "pending",
  "approved",
  "completed",
  "cancelled",
];

export const TRANSACTION_TYPES = ["buy", "rent"];

export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  TRANSACTION: "transaction",
  PROPERTY: "property",
  SYSTEM: "system",
  AUTH: "auth",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
