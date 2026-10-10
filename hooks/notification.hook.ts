"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/api/notification.api";
import type { NotificationQuery } from "@/types";

export function useNotifications(query?: NotificationQuery) {
  return useQuery({
    queryKey: ["notifications", query],
    queryFn: () => getNotifications(query),
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
