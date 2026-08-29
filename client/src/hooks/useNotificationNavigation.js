"use client";

import { useMarkNotificationRead } from "@/hooks/useNotifications";
import { invalidateNotificationTargetQueries } from "@/lib/notifications/invalidateNotificationTargetQueries";
import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useNotificationNavigation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const markReadMutation = useMarkNotificationRead();

  const navigateToNotification = useCallback(
    (notification) => {
      if (!notification?._id) {
        return;
      }

      if (!notification.isRead) {
        markReadMutation.mutate(notification._id);
      }

      void invalidateNotificationTargetQueries(queryClient, notification);

      router.push(resolveNotificationHref(notification, { role: user?.role }));
    },
    [markReadMutation, queryClient, router, user?.role],
  );

  return { navigateToNotification, markReadMutation };
}
