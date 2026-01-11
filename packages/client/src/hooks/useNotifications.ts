import { useState, useCallback } from 'react';
import type {
  Notification,
  NotificationType,
} from '../components/notifications/NotificationToast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info', duration?: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        message,
        type,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);
      return id;
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      return addNotification(message, 'success', duration);
    },
    [addNotification]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return addNotification(message, 'error', duration);
    },
    [addNotification]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return addNotification(message, 'warning', duration);
    },
    [addNotification]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return addNotification(message, 'info', duration);
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    dismissNotification,
    success,
    error,
    warning,
    info,
  };
};
