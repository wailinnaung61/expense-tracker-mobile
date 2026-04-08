export interface NotificationDto {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationSummary {
  unreadCount: number;
  latestNotifications: NotificationDto[];
}

export interface PagedNotificationResult {
  notifications: NotificationDto[];
  nextCursor: string | null;
  hasMore: boolean;
  totalUnread: number;
}

export interface NotificationFilters {
  isRead?: boolean;
  pageSize?: number;
  cursor?: string;
}
