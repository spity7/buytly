"use client";

import { formatNotificationTime } from "@/lib/notifications/formatNotificationTime";
import { getNotificationMeta } from "@/lib/notifications/notificationMeta";

export default function NotificationItem({
  notification,
  onSelect,
  compact = false,
}) {
  const meta = getNotificationMeta(notification.type);
  const isUnread = !notification.isRead;

  return (
    <button
      type="button"
      className={`notification-item${isUnread ? " notification-item--unread" : ""}${compact ? " notification-item--compact" : ""}`}
      onClick={() => onSelect?.(notification)}
    >
      <span className="notification-item__icon" aria-hidden="true">
        <i className={meta.icon} />
      </span>
      <span className="notification-item__content">
        <span className="notification-item__title">{notification.title}</span>
        <span className="notification-item__message">{notification.message}</span>
        {!compact && (
          <span className="notification-item__meta">
            <span>{meta.label}</span>
            {notification.createdAt ? (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={notification.createdAt}>
                  {formatNotificationTime(notification.createdAt)}
                </time>
              </>
            ) : null}
          </span>
        )}
      </span>
      {isUnread ? (
        <span className="notification-item__dot" aria-hidden="true" />
      ) : null}
    </button>
  );
}
