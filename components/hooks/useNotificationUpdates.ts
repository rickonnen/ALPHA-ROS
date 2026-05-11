import { useEffect, useCallback } from 'react';

type NotificationEventCallback = () => void;

class NotificationEventManager {
  private listeners: Set<NotificationEventCallback> = new Set();

  subscribe(callback: NotificationEventCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(callback => callback());
  }
}

const notificationEventManager = new NotificationEventManager();

export function useNotificationUpdates(callback: () => void) {
  useEffect(() => {
    return notificationEventManager.subscribe(callback);
  }, [callback]);
}

export function triggerNotificationUpdate() {
  notificationEventManager.notify();
}
