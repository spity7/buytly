"use client";

import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useAuth } from "@/providers/AuthProvider";
import { useCallback, useEffect, useRef, useState } from "react";

function formatBadgeCount(count) {
  if (!count || count <= 0) {
    return null;
  }
  return count > 99 ? "99+" : String(count);
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { navigateToNotification } = useNotificationNavigation();
  const { data: unreadCount = 0 } = useUnreadNotificationCount({
    enabled: Boolean(user),
  });

  const badge = formatBadgeCount(unreadCount);

  const handleSelect = useCallback(
    (notification) => {
      setOpen(false);
      navigateToNotification(notification);
    },
    [navigateToNotification],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <li className="d-none d-sm-block notification-bell-wrap" ref={containerRef}>
      <button
        type="button"
        className="text-center mr20 notif notification-bell"
        aria-label={
          badge
            ? `Notifications, ${badge} unread`
            : "Notifications, no unread notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flaticon-bell" />
        {badge ? (
          <span className="notification-bell__badge">{badge}</span>
        ) : null}
      </button>

      {open ? (
        <NotificationDropdown
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </li>
  );
}
