export function resolveNotificationHref(notification, { role } = {}) {
  const data = notification?.data || {};
  if (typeof data.href === "string" && data.href.length > 0) {
    return data.href;
  }

  const entityId = data.entityId;
  const propertyId = data.propertyId;
  const event = data.event;

  if (event === "property.pending_review") {
    if (propertyId) {
      return `/dashboard-admin-properties?highlight=${propertyId}`;
    }
    return "/dashboard-admin-properties";
  }

  switch (notification?.type) {
    case "booking":
      return entityId
        ? `/dashboard-bookings?highlight=${entityId}`
        : "/dashboard-bookings";
    case "transaction":
      return entityId
        ? `/dashboard-transactions?highlight=${entityId}`
        : "/dashboard-transactions";
    case "property":
      if (event === "review.received") {
        return propertyId
          ? `/single-v1/${propertyId}#property-reviews`
          : "/dashboard-my-properties";
      }
      return propertyId
        ? `/dashboard-my-properties?highlight=${propertyId}`
        : "/dashboard-my-properties";
    case "auth":
      return "/dashboard-my-profile";
    default:
      return "/dashboard-notifications";
  }
}
