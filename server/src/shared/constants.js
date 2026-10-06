export const ROLES = {
  BUYER: "buyer",
  SELLER: "seller",
  AGENT: "agent",
  ADMIN: "admin",
};

/** @deprecated Use catalog API — kept for tests and legacy references */
export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "duplex",
  "penthouse",
  "townhouse",
  "office",
  "shop",
  "building",
  "land",
  "chalet",
];

export const DEFAULT_CURRENCY = "USD";

/** Default sort order for units and catalog rows (lower sorts first). */
export const DEFAULT_CATALOG_SORT_ORDER = 999;

export const PROPERTY_STATUSES = [
  "draft",
  "pending",
  "active",
  "sold",
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

export const TRANSACTION_TYPES = ["buy"];

export const INQUIRY_STATUSES = ["new", "contacted", "closed"];

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
