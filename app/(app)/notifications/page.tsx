"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { createClient } from "../../../lib/client";

type Notification = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const supabase = createClient();

    let mounted = true;
    let channel:
      | ReturnType<typeof supabase.channel>
      | undefined;

    async function initializeNotifications() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError) {
        alert(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      await loadNotifications(user.id);

      if (!mounted) {
        return;
      }

      channel = supabase
        .channel(`notifications-page-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          async () => {
            if (!mounted) {
              return;
            }

            await loadNotifications(user.id);
          }
        )
        .subscribe((status, error) => {
          if (error) {
            console.error(
              "Notifications realtime error:",
              error
            );
          }

          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.warn(
              "Notifications realtime connection failed."
            );
          }
        });
    }

    initializeNotifications();

    return () => {
      mounted = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function loadNotifications(
    currentUserId: string
  ) {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        link,
        created_at
      `)
      .eq("recipient_id", currentUserId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      setNotifications([]);
      setLoading(false);
      return;
    }

    setNotifications(
      (data as Notification[]) || []
    );

    setLoading(false);
  }

  async function markAsRead(
    notificationId: string
  ) {
    if (!userId) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId)
      .eq("recipient_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    );
  }

  async function markAllAsRead() {
    if (!userId) {
      return;
    }

    setMarkingAll(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("recipient_id", userId)
      .eq("is_read", false);

    setMarkingAll(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading notifications...
      </p>
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell
              size={34}
              className="text-yellow-300"
            />

            <h1 className="text-5xl font-black">
              Notifications
            </h1>
          </div>

          <p className="mt-3 text-gray-400">
            {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
          >
            <CheckCheck size={18} />

            {markingAll
              ? "Updating..."
              : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <Bell
            size={36}
            className="mx-auto text-gray-500"
          />

          <h2 className="mt-4 text-2xl font-bold">
            No notifications yet
          </h2>

          <p className="mt-2 text-gray-400">
            New activity from gigs, housing,
            marketplace, events, carpool, follows,
            likes, and comments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const content = (
              <div
                className={`rounded-3xl border p-6 transition ${
                  notification.is_read
                    ? "border-white/10 bg-white/5"
                    : "border-yellow-400/30 bg-yellow-400/10"
                }`}
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      {!notification.is_read && (
                        <span className="h-3 w-3 rounded-full bg-yellow-300" />
                      )}

                      <h2 className="text-xl font-black">
                        {notification.title}
                      </h2>
                    </div>

                    {notification.message && (
                      <p className="mt-3 text-gray-300">
                        {notification.message}
                      </p>
                    )}

                    <p className="mt-4 text-sm text-gray-500">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>

                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                      {notification.type}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        markAsRead(notification.id);
                      }}
                      className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );

            return notification.link ? (
              <Link
                key={notification.id}
                href={notification.link}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                }}
                className="block"
              >
                {content}
              </Link>
            ) : (
              <div key={notification.id}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}