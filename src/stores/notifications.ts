import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      };
    }),
  markAllRead: () => set({ unreadCount: 0 }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
