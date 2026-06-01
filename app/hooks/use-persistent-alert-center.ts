import { useCallback, useEffect, useMemo, useState } from "react";

import type { AccountFeedbackEvent, AlertCenterItem } from "~/types";

const DEFAULT_MAX_ITEMS = 20;

export function usePersistentAlertCenter(storageKey: string, maxItems = DEFAULT_MAX_ITEMS) {
  const [alerts, setAlerts] = useState<AlertCenterItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AlertCenterItem[];
      setAlerts(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAlerts([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(alerts));
  }, [storageKey, alerts]);

  const unreadCount = useMemo(() => alerts.filter((item) => !item.read).length, [alerts]);

  const addAlert = useCallback((event: AccountFeedbackEvent) => {
    const newAlert: AlertCenterItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      severity: event.severity,
      message: event.message,
      intent: event.intent,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setAlerts((prev) => [newAlert, ...prev].slice(0, maxItems));
  }, [maxItems]);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        markAllRead();
      }
      return next;
    });
  }, [markAllRead]);

  return {
    alerts,
    unreadCount,
    isOpen,
    addAlert,
    clearAll,
    dismissAlert,
    toggleOpen,
  };
}
