import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, NotificationItem, NotificationQuery } from "@/types";

export function getNotifications(
  query?: NotificationQuery,
): Promise<ApiResponse<NotificationItem[]>> {
  return apiClient<ApiResponse<NotificationItem[]>>("/notifications", {
    query,
  });
}

export function markNotificationAsRead(
  id: string,
): Promise<ApiResponse<NotificationItem>> {
  return apiClient<ApiResponse<NotificationItem>>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsAsRead(): Promise<
  ApiResponse<{ count: number }>
> {
  return apiClient<ApiResponse<{ count: number }>>("/notifications/read-all", {
    method: "PATCH",
  });
}
