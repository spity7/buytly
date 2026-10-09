function refetchMatching(queryClient, queryKey) {
  return queryClient.refetchQueries({ queryKey, type: "active" });
}

/**
 * Refetches dashboard/list queries tied to a notification so deep-link navigation
 * shows current server state (e.g. listing status) without a manual page refresh.
 */
export function invalidateNotificationTargetQueries(queryClient, notification) {
  if (!notification) {
    return Promise.resolve();
  }

  const data = notification.data || {};
  const event = data.event;
  const type = notification.type;
  const propertyId = data.propertyId;
  const href = typeof data.href === "string" ? data.href : "";

  const tasks = [];

  if (
    event === "property.pending_review" ||
    href.includes("/dashboard-admin-properties")
  ) {
    tasks.push(refetchMatching(queryClient, ["admin-properties"]));
  }

  if (event === "review.received" || href.includes("#property-reviews")) {
    if (propertyId) {
      tasks.push(refetchMatching(queryClient, ["property", propertyId]));
      tasks.push(
        refetchMatching(queryClient, ["property-reviews", propertyId]),
      );
    }
    return Promise.all(tasks);
  }

  switch (type) {
    case "property":
      tasks.push(refetchMatching(queryClient, ["my-properties"]));
      if (propertyId) {
        tasks.push(refetchMatching(queryClient, ["property", propertyId]));
      }
      break;
    case "booking":
      tasks.push(refetchMatching(queryClient, ["my-bookings"]));
      tasks.push(refetchMatching(queryClient, ["agent-bookings"]));
      break;
    case "transaction":
      tasks.push(refetchMatching(queryClient, ["my-transactions"]));
      tasks.push(refetchMatching(queryClient, ["my-properties"]));
      break;
    default:
      if (href.includes("/dashboard-my-properties")) {
        tasks.push(refetchMatching(queryClient, ["my-properties"]));
      } else if (href.includes("/dashboard-bookings")) {
        tasks.push(refetchMatching(queryClient, ["my-bookings"]));
        tasks.push(refetchMatching(queryClient, ["agent-bookings"]));
      } else if (href.includes("/dashboard-transactions")) {
        tasks.push(refetchMatching(queryClient, ["my-transactions"]));
      }
      break;
  }

  return Promise.all(tasks);
}
