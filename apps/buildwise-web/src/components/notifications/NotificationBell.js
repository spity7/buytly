"use client";

import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useAuth } from "@/providers/AuthProvider";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

function formatBadgeCount(count) {
  if (!count || count <= 0) {
    return null;
  }
  return count > 99 ? "99+" : String(count);
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, right: 16 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { navigateToNotification } = useNotificationNavigation();
  const { data: unreadCount = 0 } = useUnreadNotificationCount({
    enabled: Boolean(user),
  });

  const badge = formatBadgeCount(unreadCount);

  const updateAnchor = useCallback(() => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    setAnchor({
      top: rect.bottom + 12,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  }, []);

  const handleSelect = useCallback(
    (notification) => {
      setOpen(false);
      navigateToNotification(notification);
    },
    [navigateToNotification],
  );

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [open, updateAnchor]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;
      const insideBell = buttonRef.current?.contains(target);
      const insidePanel = dropdownRef.current?.contains(target);
      if (!insideBell && !insidePanel) {
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

  const dropdown =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            className="notification-dropdown-anchor"
            style={{
              top: anchor.top,
              right: anchor.right,
            }}
          >
            <NotificationDropdown
              onSelect={handleSelect}
              onClose={() => setOpen(false)}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <li className="d-none d-sm-block notification-bell-wrap">
        <button
          ref={buttonRef}
          type="button"
          className={`header-action-btn notif notification-bell${open ? " notification-bell--open" : ""}`}
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
      </li>
      {dropdown}
    </>
  );
}
