"use client";

import NotificationItem from "@/components/notifications/NotificationItem";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { useMemo, useState } from "react";

const TABS = [
  { id: "all", label: "All", unread: undefined },
  { id: "unread", label: "Unread", unread: "true" },
];

export default function NotificationsPanel() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const { navigateToNotification } = useNotificationNavigation();

  const activeTab = TABS.find((item) => item.id === tab) || TABS[0];
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(activeTab.unread ? { unread: activeTab.unread } : {}),
    }),
    [activeTab.unread, page],
  );

  const { data, isLoading, isError, isFetching } = useNotifications(params);
  const markAllMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleSelect = (notification) => {
    navigateToNotification(notification);
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();
    await deleteMutation.mutateAsync(notificationId);
  };

  return (
    <div className="notifications-panel ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
      <div className="notifications-panel__header">
        <div>
          <h2 className="title mb-0">Notifications</h2>
          <p className="text mb0">
            Stay updated on bookings, listings, and account activity.
          </p>
        </div>
        <button
          type="button"
          className="ud-btn btn-thm-border btn-sm"
          disabled={markAllMutation.isPending}
          onClick={() => markAllMutation.mutate()}
        >
          Mark all read
        </button>
      </div>

      <div
        className="notifications-panel__tabs"
        role="tablist"
        aria-label="Notification filters"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`notifications-panel__tab${tab === item.id ? " notifications-panel__tab--active" : ""}`}
            onClick={() => {
              setTab(item.id);
              setPage(1);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="notifications-panel__list">
        {isLoading ? (
          <p className="notifications-panel__status">Loading notifications…</p>
        ) : null}
        {isError ? (
          <p className="notifications-panel__status notifications-panel__status--error">
            Could not load notifications.
          </p>
        ) : null}
        {!isLoading && !isError && notifications.length === 0 ? (
          <p className="notifications-panel__status">No notifications yet.</p>
        ) : null}
        {!isLoading && !isError
          ? notifications.map((notification) => (
              <div key={notification._id} className="notifications-panel__row">
                <NotificationItem
                  notification={notification}
                  onSelect={handleSelect}
                />
                <button
                  type="button"
                  className="notifications-panel__delete"
                  aria-label="Delete notification"
                  disabled={deleteMutation.isPending}
                  onClick={(event) => handleDelete(event, notification._id)}
                >
                  <span className="flaticon-close" aria-hidden="true" />
                </button>
              </div>
            ))
          : null}
      </div>

      {totalPages > 1 ? (
        <div className="notifications-panel__pagination">
          <button
            type="button"
            className="ud-btn btn-white2 btn-sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span className="notifications-panel__page">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="ud-btn btn-white2 btn-sm"
            disabled={page >= totalPages || isFetching}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
