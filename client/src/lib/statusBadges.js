const LISTING_STATUS_LABELS = {
  draft: "Draft",
  pending: "Pending Review",
  active: "Published",
  sold: "Sold",
  archived: "Archived",
};

const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

const TRANSACTION_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ACCOUNT_STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  deleted: "Deleted",
};

/** Visual tone keys — mapped to `.status-badge--{tone}` in SCSS. */
export function getListingStatusTone(status, { trash = false } = {}) {
  if (trash) return "trash";
  switch (status) {
    case "draft":
      return "draft";
    case "pending":
      return "pending";
    case "active":
      return "published";
    case "sold":
    case "rented":
      return "success";
    case "archived":
      return "muted";
    default:
      return "pending";
  }
}

export function getBookingStatusTone(status) {
  switch (status) {
    case "pending":
      return "pending";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "cancelled":
      return "muted";
    case "completed":
      return "success";
    default:
      return "muted";
  }
}

export function getTransactionStatusTone(status) {
  switch (status) {
    case "pending":
      return "pending";
    case "approved":
      return "published";
    case "completed":
      return "success";
    case "cancelled":
      return "muted";
    default:
      return "muted";
  }
}

export function getAccountStatusTone({ isActive, isDeleted }) {
  if (isDeleted) return "danger";
  return isActive ? "account-active" : "account-inactive";
}

export function getStatusBadgeTone(
  status,
  { domain = "listing", trash = false, isActive, isDeleted } = {},
) {
  if (domain === "booking") return getBookingStatusTone(status);
  if (domain === "transaction") return getTransactionStatusTone(status);
  if (domain === "account") {
    return getAccountStatusTone({ isActive, isDeleted });
  }
  return getListingStatusTone(status, { trash });
}

export function getStatusBadgeLabel(
  status,
  { domain = "listing", trash = false, isActive, isDeleted, label } = {},
) {
  if (label) return label;
  if (domain === "booking") {
    return BOOKING_STATUS_LABELS[status] || status || "—";
  }
  if (domain === "transaction") {
    return TRANSACTION_STATUS_LABELS[status] || status || "—";
  }
  if (domain === "account") {
    if (isDeleted) return ACCOUNT_STATUS_LABELS.deleted;
    return isActive
      ? ACCOUNT_STATUS_LABELS.active
      : ACCOUNT_STATUS_LABELS.inactive;
  }
  if (trash) return "In trash";
  return LISTING_STATUS_LABELS[status] || status || "—";
}

export function getStatusBadgeClassName(options = {}) {
  const tone = options.tone || getStatusBadgeTone(options.status, options);
  return `status-badge status-badge--${tone}`;
}

/** @deprecated Prefer `<StatusBadge />` — kept for any legacy call sites. */
export function getListingStatusBadgeClassName(status, { trash = false } = {}) {
  return getStatusBadgeClassName({ status, domain: "listing", trash });
}

export function getPropertyStatusBadgeProps(
  property,
  { isTrashView = false } = {},
) {
  const trash = isTrashView || Boolean(property?.deletedAt);
  return {
    domain: "listing",
    status: property?.status,
    trash,
    label: getStatusBadgeLabel(property?.status, { domain: "listing", trash }),
  };
}

export function getProjectStatusBadgeProps(
  project,
  { isTrashView = false } = {},
) {
  const trash = isTrashView || Boolean(project?.deletedAt);
  return {
    domain: "listing",
    status: project?.status,
    trash,
    label: getStatusBadgeLabel(project?.status, { domain: "listing", trash }),
  };
}
