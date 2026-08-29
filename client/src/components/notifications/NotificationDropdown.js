"use client";

import NotificationItem from "@/components/notifications/NotificationItem";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import Link from "next/link";
import { useCallback } from "react";

export default function NotificationDropdown({ onSelect, onClose }) {
  const { data, isLoading, isError } = useNotifications(
    { limit: 8, unread: "true" },
    { enabled: true },
  );
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const hasUnread = notifications.length > 0;

  const handleMarkAllRead = useCallback(async () => {
    await markAllMutation.mutateAsync();
  }, [markAllMutation]);

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown__header">
        <h3 className="notification-dropdown__title">Notifications</h3>
        {hasUnread ? (
          <button
            type="button"
            className="notification-dropdown__mark-all"
            disabled={markAllMutation.isPending}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </button>
        ) : null}
      </div>

      <div className="notification-dropdown__body">
        {isLoading ? (
          <p className="notification-dropdown__status">
            Loading notifications…
          </p>
        ) : null}
        {isError ? (
          <p className="notification-dropdown__status notification-dropdown__status--error">
            Could not load notifications.
          </p>
        ) : null}
        {!isLoading && !isError && notifications.length === 0 ? (
          <p className="notification-dropdown__status">
            You&apos;re all caught up.
          </p>
        ) : null}
        {!isLoading && !isError
          ? notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                compact
                onSelect={(item) => {
                  onSelect?.(item);
                }}
              />
            ))
          : null}
      </div>

      <div className="notification-dropdown__footer">
        <Link
          href="/dashboard-notifications"
          className="notification-dropdown__view-all"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
