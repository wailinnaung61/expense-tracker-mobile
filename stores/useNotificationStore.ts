import { create } from "zustand";
import { notificationService } from "@/services";
import type { NotificationDto, PagedNotificationResult } from "@/types/notification.types";

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  latestNotifications: NotificationDto[];
  isLoading: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  
  // Actions
  fetchSummary: () => Promise<void>;
  fetchNotifications: (loadMore?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  latestNotifications: [],
  isLoading: false,
  error: null,
  nextCursor: null,
  hasMore: false,

  fetchSummary: async () => {
    try {
      const summary = await notificationService.getSummary();
      set({
        unreadCount: summary.unreadCount,
        latestNotifications: summary.latestNotifications,
      });
    } catch (error: any) {
      console.error("Failed to fetch notification summary:", error);
    }
  },

  fetchNotifications: async (loadMore = false) => {
    set({ isLoading: true, error: null });
    try {
      const { nextCursor } = get();
      const result: PagedNotificationResult = await notificationService.getNotifications({
        cursor: loadMore ? nextCursor || undefined : undefined,
        pageSize: 20,
      });

      set((state) => ({
        notifications: loadMore
          ? [...state.notifications, ...result.notifications]
          : result.notifications,
        unreadCount: result.totalUnread,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch notifications";
      set({ error: errorMessage, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update locally
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.notificationId === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        latestNotifications: state.latestNotifications.map((n) =>
          n.notificationId === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true });
    try {
      await notificationService.markAllAsRead();
      
      // Update locally
      const now = new Date().toISOString();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true, readAt: now })),
        latestNotifications: state.latestNotifications.map((n) => ({ ...n, isRead: true, readAt: now })),
        unreadCount: 0,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to mark all as read";
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      
      // Remove locally
      set((state) => {
        const deletedNotification = state.notifications.find((n) => n.notificationId === id);
        return {
          notifications: state.notifications.filter((n) => n.notificationId !== id),
          latestNotifications: state.latestNotifications.filter((n) => n.notificationId !== id),
          unreadCount: deletedNotification && !deletedNotification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (error: any) {
      console.error("Failed to delete notification:", error);
    }
  },

  deleteAllRead: async () => {
    set({ isLoading: true });
    try {
      await notificationService.deleteAllRead();
      
      // Remove read notifications locally
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.isRead),
        latestNotifications: state.latestNotifications.filter((n) => !n.isRead),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete read notifications";
      set({ error: errorMessage, isLoading: false });
    }
  },

  refreshUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error: any) {
      console.error("Failed to refresh unread count:", error);
    }
  },

  clearError: () => set({ error: null }),
}));
