function isUnreadFilter(params) {
  return params?.unread === "true" || params?.unread === true;
}

function patchNotificationLists(queryClient, patchList) {
  for (const [queryKey, old] of queryClient.getQueriesData({
    queryKey: ["notifications"],
  })) {
    if (queryKey[1] === "unread-count" || !old?.notifications) {
      continue;
    }

    const params = queryKey[1] || {};
    const { notifications, totalDelta = 0 } = patchList(
      old.notifications,
      params,
    );

    queryClient.setQueryData(queryKey, {
      ...old,
      notifications,
      pagination: old.pagination
        ? {
            ...old.pagination,
            total: Math.max(0, (old.pagination.total ?? 0) + totalDelta),
          }
        : old.pagination,
    });
  }
}

export function applyNotificationRead(queryClient, notificationId) {
  const id = String(notificationId);
  let wasUnread = false;
  const readAt = new Date().toISOString();

  patchNotificationLists(queryClient, (notifications, params) => {
    const unreadOnly = isUnreadFilter(params);
    let totalDelta = 0;

    const next = notifications
      .map((notification) => {
        if (String(notification._id) !== id) {
          return notification;
        }

        if (!notification.isRead) {
          wasUnread = true;
        }

        return {
          ...notification,
          isRead: true,
          readAt: notification.readAt || readAt,
        };
      })
      .filter((notification) => (unreadOnly ? !notification.isRead : true));

    if (unreadOnly && wasUnread) {
      totalDelta = -1;
    }

    return { notifications: next, totalDelta };
  });

  if (wasUnread) {
    queryClient.setQueryData(["notifications", "unread-count"], (count) =>
      Math.max(0, (count ?? 0) - 1),
    );
  }
}

export function applyAllNotificationsRead(queryClient) {
  const readAt = new Date().toISOString();

  patchNotificationLists(queryClient, (notifications, params) => {
    const unreadOnly = isUnreadFilter(params);

    if (unreadOnly) {
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return {
        notifications: [],
        totalDelta: -unreadCount,
      };
    }

    return {
      notifications: notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || readAt,
      })),
      totalDelta: 0,
    };
  });

  queryClient.setQueryData(["notifications", "unread-count"], 0);
}

export function applyNotificationDelete(queryClient, notificationId) {
  const id = String(notificationId);
  let wasUnread = false;

  patchNotificationLists(queryClient, (notifications) => {
    const removed = notifications.find(
      (notification) => String(notification._id) === id,
    );

    if (removed && !removed.isRead) {
      wasUnread = true;
    }

    return {
      notifications: notifications.filter(
        (notification) => String(notification._id) !== id,
      ),
      totalDelta: -1,
    };
  });

  if (wasUnread) {
    queryClient.setQueryData(["notifications", "unread-count"], (count) =>
      Math.max(0, (count ?? 0) - 1),
    );
  }
}
