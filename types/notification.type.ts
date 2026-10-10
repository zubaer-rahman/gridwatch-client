export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQuery {
  isRead?: boolean;
  page?: number;
  limit?: number;
}
