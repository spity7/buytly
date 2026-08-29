"use client";

import { buytlyApi } from "@/api/generated";
import { invalidateNotificationQueries } from "@/lib/notifications/invalidateNotificationQueries";
import {
  applyAllNotificationsRead,
  applyNotificationDelete,
  applyNotificationRead,
} from "@/lib/notifications/notificationQueryCache";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const UNREAD_POLL_INTERVAL_MS = 30_000;

export function useNotifications(params = {}, options = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const response = await buytlyApi.listNotifications(params);
      return {
        notifications: response.data || [],
        pagination: response.pagination,
      };
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useUnreadNotificationCount(options = {}) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await buytlyApi.getUnreadNotificationCount();
      return response.data?.count ?? 0;
    },
    refetchInterval: UNREAD_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    ...options,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => buytlyApi.markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      applyNotificationRead(queryClient, id);
    },
    onSettled: () => invalidateNotificationQueries(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => buytlyApi.markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      applyAllNotificationsRead(queryClient);
    },
    onSettled: () => invalidateNotificationQueries(queryClient),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => buytlyApi.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      applyNotificationDelete(queryClient, id);
    },
    onSettled: () => invalidateNotificationQueries(queryClient),
  });
}
