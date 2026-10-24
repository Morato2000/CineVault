
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const NotificationsContext = createContext(null);

function rowToNotification(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    image: row.image,
    link: row.link,
    read: row.read,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const notifiedKeysRef = useRef(new Set());
  const currentUserIdRef = useRef(userId);

  // Track the active account without depending on the whole user object.
  currentUserIdRef.current = userId;

  // ------------------------------------------------------------
  // LOAD NOTIFICATIONS + DEDUPE KEYS
  // ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    notifiedKeysRef.current = new Set();
    setNotifications([]);
    setLoading(true);

    if (!userId) {
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    async function loadNotifications() {
      try {
        const [notificationsRes, keysRes] = await Promise.all([
          supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(200),

          supabase
            .from("notification_keys")
            .select("dedupe_key")
            .eq("user_id", userId),
        ]);

        if (
          cancelled ||
          currentUserIdRef.current !== userId
        ) {
          return;
        }

        if (notificationsRes.error) {
          console.error(
            "Failed to load notifications:",
            notificationsRes.error
          );
        } else {
          setNotifications(
            (notificationsRes.data || []).map(rowToNotification)
          );
        }

        if (keysRes.error) {
          console.error(
            "Failed to load notification keys:",
            keysRes.error
          );

          notifiedKeysRef.current = new Set();
        } else {
          notifiedKeysRef.current = new Set(
            (keysRes.data || []).map((row) => row.dedupe_key)
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load notification data:", error);
        }
      } finally {
        if (
          !cancelled &&
          currentUserIdRef.current === userId
        ) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ------------------------------------------------------------
  // CHECK DEDUPE KEY
  // ------------------------------------------------------------

  const hasBeenNotified = useCallback((key) => {
    return notifiedKeysRef.current.has(key);
  }, []);

  // ------------------------------------------------------------
  // ADD NOTIFICATION
  // ------------------------------------------------------------

  const addNotification = useCallback(
    ({ title, message, image, link, dedupeKey }) => {
      if (!userId) return false;

      // Prevent duplicate notifications synchronously.
      if (dedupeKey && notifiedKeysRef.current.has(dedupeKey)) {
        return false;
      }

      // Reserve the key before updating state or starting requests.
      if (dedupeKey) {
        notifiedKeysRef.current.add(dedupeKey);
      }

      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const optimisticNotification = {
        id: tempId,
        title,
        message,
        image: image || null,
        link: link || null,
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => [
        optimisticNotification,
        ...prev,
      ]);

      async function saveNotification() {
        try {
          // Persist the dedupe key first, if provided.
          if (dedupeKey) {
            const { error: keyError } = await supabase
              .from("notification_keys")
              .insert({
                user_id: userId,
                dedupe_key: dedupeKey,
              });

            if (keyError) {
              // A duplicate key can mean another request already
              // registered this notification. Don't create another.
              console.error(
                "Failed to save notification key:",
                keyError
              );

              if (currentUserIdRef.current === userId) {
                setNotifications((prev) =>
                  prev.filter(
                    (notification) => notification.id !== tempId
                  )
                );
              }

              notifiedKeysRef.current.add(dedupeKey);
              return;
            }
          }

          const { data, error } = await supabase
            .from("notifications")
            .insert({
              user_id: userId,
              title,
              message,
              image: image || null,
              link: link || null,
            })
            .select()
            .single();

          if (error) {
            console.error(
              "Failed to save notification:",
              error
            );

            if (currentUserIdRef.current === userId) {
              setNotifications((prev) =>
                prev.filter(
                  (notification) => notification.id !== tempId
                )
              );
            }

            // Remove the persisted key if the notification failed.
            if (dedupeKey) {
              await supabase
                .from("notification_keys")
                .delete()
                .eq("user_id", userId)
                .eq("dedupe_key", dedupeKey);

              notifiedKeysRef.current.delete(dedupeKey);
            }

            return;
          }

          // Don't update another account's UI after an account switch.
          if (currentUserIdRef.current !== userId) return;

          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === tempId
                ? rowToNotification(data)
                : notification
            )
          );
        } catch (error) {
          console.error(
            "Unexpected error saving notification:",
            error
          );

          if (currentUserIdRef.current === userId) {
            setNotifications((prev) =>
              prev.filter(
                (notification) => notification.id !== tempId
              )
            );
          }

          if (dedupeKey) {
            notifiedKeysRef.current.delete(dedupeKey);
          }
        }
      }

      saveNotification();

      return true;
    },
    [userId]
  );

  // ------------------------------------------------------------
  // MARK AS READ
  // ------------------------------------------------------------

  const markAsRead = useCallback(
    async (id) => {
      if (!userId) return;

      let previousRead;

      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id !== id) return notification;

          previousRead = notification.read;

          return {
            ...notification,
            read: true,
          };
        })
      );

      // Temporary notifications aren't in the database yet.
      if (typeof id === "string" && id.startsWith("temp-")) {
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );

        if (currentUserIdRef.current === userId) {
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === id
                ? {
                    ...notification,
                    read: previousRead ?? false,
                  }
                : notification
            )
          );
        }
      }
    },
    [userId]
  );

  // ------------------------------------------------------------
  // MARK ALL AS READ
  // ------------------------------------------------------------

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    let previousStates = [];

    setNotifications((prev) => {
      previousStates = prev.map((notification) => ({
        id: notification.id,
        read: notification.read,
      }));

      return prev.map((notification) => ({
        ...notification,
        read: true,
      }));
    });

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      if (currentUserIdRef.current === userId) {
        const previousById = new Map(
          previousStates.map((item) => [item.id, item.read])
        );

        setNotifications((prev) =>
          prev.map((notification) =>
            previousById.has(notification.id)
              ? {
                  ...notification,
                  read: previousById.get(notification.id),
                }
              : notification
          )
        );
      }
    }
  }, [userId]);

  // ------------------------------------------------------------
  // CLEAR ALL
  // ------------------------------------------------------------

  const clearAll = useCallback(async () => {
    if (!userId) return;

    const previousKeys = new Set(notifiedKeysRef.current);

    setNotifications([]);
    notifiedKeysRef.current = new Set();

    const { error: notificationsError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (notificationsError) {
      console.error(
        "Failed to clear notifications:",
        notificationsError
      );

      if (currentUserIdRef.current === userId) {
        notifiedKeysRef.current = previousKeys;

        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(200);

        if (currentUserIdRef.current === userId && data) {
          setNotifications(data.map(rowToNotification));
        }
      }

      return;
    }

    const { error: keysError } = await supabase
      .from("notification_keys")
      .delete()
      .eq("user_id", userId);

    if (keysError) {
      console.error(
        "Failed to clear notification keys:",
        keysError
      );

      // Notifications are already deleted. Restore the in-memory
      // keys to avoid duplicates if key cleanup failed.
      if (currentUserIdRef.current === userId) {
        notifiedKeysRef.current = previousKeys;
      }
    }
  }, [userId]);

  // ------------------------------------------------------------
  // UNREAD COUNT
  // ------------------------------------------------------------

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
        hasBeenNotified,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }

  return context;
}
