import { useState } from "react";

import { Link } from "react-router-dom";

import {
  IoTrashOutline,
  IoNotificationsOutline,
  IoCheckmarkDoneOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

import { useNotifications } from "../context/NotificationsContext";

import { formatRelativeTime } from "../utils/formatRelativeTime";

import noNotificationsArt from "../assets/images/no-notifications.png";

function groupByDay(notifications) {
  const groups = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  notifications.forEach((n) => {
    const diff = now - n.timestamp;

    if (
      diff < day &&
      new Date(n.timestamp).getDate() === new Date(now).getDate()
    ) {
      groups.Today.push(n);
    } else if (diff < 2 * day) {
      groups.Yesterday.push(n);
    } else if (diff < 7 * day) {
      groups["This Week"].push(n);
    } else {
      groups.Earlier.push(n);
    }
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

function Notifications() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    filter === "Unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const grouped = groupByDay(filtered);

  return (
    <div className="min-h-screen px-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-b from-[#A855F7] to-[#3B82F6] shadow-lg shadow-purple-500/20">
            <IoNotificationsOutline className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              My Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Stay updated with your watchlist, releases and recommendations.
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 text-sm font-medium text-purple-400 transition hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IoCheckmarkDoneOutline className="h-4 w-4" />
              Mark all as read
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-full border border-red-500/40 px-3.5 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              <IoTrashOutline className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notification Summary */}
      {notifications.length > 0 && (
        <div className="mt-7 rounded-2xl border border-indigo-500/20 bg-[#0B0F1A] p-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Notification Center
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {notifications.length}
                </span>

                <span className="text-sm text-gray-500">
                  {notifications.length === 1
                    ? "notification"
                    : "notifications"}
                </span>
              </div>
            </div>

            <div className="h-px flex-1 bg-white/5 sm:mx-6" />

            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-gray-400">
                Unread
              </p>

              <div className="mt-1 flex items-center gap-2 sm:justify-end">
                <span className="text-2xl font-bold text-purple-400">
                  {unreadCount}
                </span>

                {unreadCount > 0 && (
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {notifications.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {["All", "Unread"].map((f) => {
            const count =
              f === "Unread" ? unreadCount : notifications.length;

            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  filter === f
                    ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white shadow-lg shadow-purple-500/10"
                    : "border border-[#477DF7]/50 text-gray-300 hover:border-[#477DF7] hover:bg-white/5"
                }`}
              >
                {f}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    filter === f
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-indigo-500/20 bg-[#0B0F1A] px-6 py-16">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-center gap-8 text-center sm:flex-row sm:items-center sm:gap-14 sm:text-left">
            <img
              src={noNotificationsArt}
              alt=""
              className="h-60 w-auto shrink-0 drop-shadow-[0_0_35px_rgba(168,85,247,0.25)]"
            />

            <div className="max-w-md">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-xs font-semibold text-purple-300">
                <IoCheckmarkDoneOutline className="h-3.5 w-3.5" />
                You're all caught up
              </div>

              <h2 className="text-2xl font-bold text-white">
                No new notifications yet
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-400">
                You're all caught up! We'll let you know when something
                worth checking out happens.
              </p>
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* No unread notifications */
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-indigo-500/20 bg-[#0B0F1A] px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
            <IoCheckmarkDoneOutline className="h-7 w-7 text-purple-400" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-white">
            You're all caught up
          </h2>

          <p className="mt-2 max-w-sm text-sm text-gray-400">
            There are no unread notifications right now.
          </p>

          <button
            type="button"
            onClick={() => setFilter("All")}
            className="mt-5 rounded-full border border-[#477DF7]/60 px-5 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
          >
            View all notifications
          </button>
        </div>
      ) : (
        /* Notifications */
        <div className="mt-8 space-y-8">
          {grouped.map(([label, items]) => (
            <div key={label}>
              {/* Group Header */}
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                  {label}
                </h2>

                <div className="h-px flex-1 bg-white/5" />

                <span className="text-xs text-gray-600">
                  {items.length}
                </span>
              </div>

              {/* Notification Cards */}
              <div className="space-y-2">
                {items.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || "#"}
                    onClick={() => markAsRead(n.id)}
                    className={`group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                      n.read
                        ? "border-white/5 bg-[#0B0F1A] hover:border-indigo-500/20 hover:bg-[#0E1422]"
                        : "border-purple-500/20 bg-[#0D1220] hover:border-purple-500/40 hover:bg-[#101629]"
                    }`}
                  >
                    {/* Unread accent */}
                    {!n.read && (
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-linear-to-b from-[#A855F7] to-[#3B82F6]" />
                    )}

                    {/* Poster */}
                    {n.image ? (
                      <img
                        src={n.image}
                        alt=""
                        className="h-20 w-14 shrink-0 rounded-xl object-cover ring-1 ring-white/5"
                      />
                    ) : (
                      <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/5">
                        <IoNotificationsOutline className="h-5 w-5 text-gray-600" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {n.title}
                          </p>

                          <p className="mt-1 text-sm leading-relaxed text-gray-400">
                            {n.message}
                          </p>
                        </div>

                        <IoChevronForwardOutline className="mt-1 h-4 w-4 shrink-0 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-purple-400" />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-purple-400">
                          {formatRelativeTime(n.timestamp)}
                        </span>

                        {!n.read && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-gray-600" />

                            <span className="flex items-center gap-1.5 text-xs font-medium text-purple-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              Unread
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;