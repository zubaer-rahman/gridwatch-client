"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/api/notification.api";
import { useCurrentUser } from "@/hooks/auth.hook";
import type { NotificationQuery } from "@/types";

export function useNotifications(query?: NotificationQuery) {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ["notifications", query],
    queryFn: () => getNotifications(query),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Background poll every 30s for live alerts
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
