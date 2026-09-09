"use client";

import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";

const formatWhen = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function DashboardRecentActivities() {
  const { data, isLoading, isError } = useNotifications({ limit: 6 });

  if (isLoading) {
    return <p className="text mb0">Loading recent activity...</p>;
  }

  if (isError) {
    return <p className="text-danger mb0">Could not load recent activity.</p>;
  }

  const notifications = data?.notifications || [];

  if (!notifications.length) {
    return <p className="text mb0">No recent activity yet.</p>;
  }

  return (
    <>
      {notifications.map((notification) => (
        <div
          key={notification._id || notification.id}
          className="recent-activity d-sm-flex align-items-center mb20"
        >
          <span className="icon me-3 flaticon-bell flex-shrink-0" />
          <p className="text mb-0 flex-grow-1">
            <span className="fw600 d-block">{notification.title}</span>
            {notification.message}
            <span className="d-block fz13 text-muted mt-1">
              {formatWhen(notification.createdAt)}
            </span>
          </p>
        </div>
      ))}
      <div className="d-grid">
        <Link href="/dashboard-notifications" className="ud-btn btn-white2">
          View More
          <i className="fal fa-arrow-right-long" />
        </Link>
      </div>
    </>
  );
}
