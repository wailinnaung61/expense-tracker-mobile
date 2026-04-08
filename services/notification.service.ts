import api from "@/lib/api";
import type {
  NotificationSummary,
  PagedNotificationResult,
  NotificationFilters,
} from "@/types/notification.types";

export const notificationService = {
  /**
   * Get notification summary (unread count + latest 5 notifications)
   * Used for notification bell badge and dropdown
   */
  getSummary: async (): Promise<NotificationSummary> => {
    const response = await api.get<NotificationSummary>("/api/notifications/summary");
    return response.data;
  },

  /**
   * Get just the unread count
   * Used for polling badge count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<number>("/api/notifications/unread-count");
    return response.data;
  },

  /**
   * Get paginated notifications
   * @param filters - Optional filters (isRead, pageSize, cursor)
   */
  getNotifications: async (filters?: NotificationFilters): Promise<PagedNotificationResult> => {
    const params = new URLSearchParams();

    if (filters?.isRead !== undefined) {
      params.append("isRead", String(filters.isRead));
    }
    if (filters?.pageSize) {
      params.append("pageSize", String(filters.pageSize));
    }
    if (filters?.cursor) {
      params.append("cursor", filters.cursor);
    }

    const queryString = params.toString();
    const url = queryString ? `/api/notifications?${queryString}` : "/api/notifications";

    const response = await api.get<PagedNotificationResult>(url);
    return response.data;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/api/notifications/read-all");
  },

  /**
   * Delete a single notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },

  /**
   * Delete all read notifications
   */
  deleteAllRead: async (): Promise<void> => {
    await api.delete("/api/notifications/read");
  },
};
