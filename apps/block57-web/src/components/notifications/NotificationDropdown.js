"use client";

import NotificationItem from "@/components/notifications/NotificationItem";
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import Link from "next/link";
import { useCallback, useId } from "react";

function NotificationDropdownSkeleton() {
  return (
    <div className="notification-dropdown__skeleton" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="notification-dropdown__skeleton-row">
          <span className="notification-dropdown__skeleton-avatar" />
          <span className="notification-dropdown__skeleton-lines">
            <span className="notification-dropdown__skeleton-line notification-dropdown__skeleton-line--short" />
            <span className="notification-dropdown__skeleton-line" />
          </span>
        </div>
      ))}
    </div>
  );
}

function NotificationDropdownEmpty({ allCaughtUp }) {
  return (
    <div
      className={`notification-dropdown__empty${allCaughtUp ? " notification-dropdown__empty--caught-up" : ""}`}
    >
      <span
        className={`notification-dropdown__empty-icon${allCaughtUp ? " notification-dropdown__empty-icon--success" : ""} flaticon-bell`}
        aria-hidden="true"
      />
      <p className="notification-dropdown__empty-title">
        {allCaughtUp ? "You're all caught up" : "No notifications yet"}
      </p>
      <p className="notification-dropdown__empty-text">
        {allCaughtUp
          ? "New booking, listing, and account updates will show up here."
          : "When something needs your attention, you'll see it here."}
      </p>
    </div>
  );
}

export default function NotificationDropdown({ onSelect, onClose }) {
  const titleId = useId();
  const { data, isLoading, isError } = useNotifications({ limit: 8 });
  const markAllMutation = useMarkAllNotificationsRead();
  const { data: unreadCount = 0, isLoading: isUnreadCountLoading } =
    useUnreadNotificationCount();

  const notifications = data?.notifications || [];
  const hasUnread = unreadCount > 0;
  const showEmpty = !isLoading && !isError && notifications.length === 0;
  const allCaughtUp = showEmpty && !hasUnread && !isUnreadCountLoading;

  const handleMarkAllRead = useCallback(async () => {
    await markAllMutation.mutateAsync();
  }, [markAllMutation]);

  const subtitle = (() => {
    if (isUnreadCountLoading) {
      return "Checking for updates…";
    }
    if (hasUnread) {
      return unreadCount === 1 ? "1 unread" : `${unreadCount} unread`;
    }
    return "All caught up";
  })();

  return (
    <div
      className="notification-dropdown"
      role="dialog"
      aria-labelledby={titleId}
    >
      <div className="notification-dropdown__header">
        <div className="notification-dropdown__heading">
          <h3 id={titleId} className="notification-dropdown__title">
            Notifications
          </h3>
          <p
            className={`notification-dropdown__subtitle${!hasUnread && !isUnreadCountLoading ? " notification-dropdown__subtitle--muted" : ""}${hasUnread ? " notification-dropdown__subtitle--active" : ""}`}
          >
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          className="notification-dropdown__mark-all"
          disabled={
            !hasUnread || isUnreadCountLoading || markAllMutation.isPending
          }
          onClick={handleMarkAllRead}
        >
          {markAllMutation.isPending ? "Marking…" : "Mark all read"}
        </button>
      </div>

      <div className="notification-dropdown__body">
        {isLoading ? <NotificationDropdownSkeleton /> : null}
        {isError ? (
          <p className="notification-dropdown__status notification-dropdown__status--error">
            Could not load notifications. Try again in a moment.
          </p>
        ) : null}
        {showEmpty ? (
          <NotificationDropdownEmpty allCaughtUp={allCaughtUp} />
        ) : null}
        {!isLoading && !isError && notifications.length > 0 ? (
          <ul className="notification-dropdown__list">
            {notifications.map((notification) => (
              <li key={notification._id}>
                <NotificationItem
                  notification={notification}
                  compact
                  onSelect={(item) => {
                    onSelect?.(item);
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="notification-dropdown__footer">
        <Link
          href="/dashboard-notifications"
          className="notification-dropdown__view-all"
          onClick={onClose}
        >
          <span>View all notifications</span>
          <span className="notification-dropdown__chevron" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
