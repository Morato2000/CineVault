import { createContext, useContext, useEffect, useState } from "react";

// import {
//   getTitleDetails,
//   getSeasonDetails,
//   getNewReleases,
// } from "../services/tmdb";

const NotificationsContext = createContext(null);

const STORAGE_KEY = "cinevault_notifications";
const NOTIFIED_KEYS_STORAGE_KEY = "cinevault_notified_keys";

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Tracks which notification events have already fired.
  const [notifiedKeys, setNotifiedKeys] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIFIED_KEYS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // localStorage unavailable — fail silently
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(
        NOTIFIED_KEYS_STORAGE_KEY,
        JSON.stringify(notifiedKeys),
      );
    } catch {
      // localStorage unavailable — fail silently
    }
  }, [notifiedKeys]);

  const hasBeenNotified = (key) => notifiedKeys.includes(key);

  const markNotified = (key) => {
    setNotifiedKeys((prev) =>
      prev.includes(key) ? prev : [...prev, key],
    );
  };

  const addNotification = ({
    title,
    message,
    image,
    link,
    dedupeKey,
  }) => {
    if (dedupeKey && hasBeenNotified(dedupeKey)) {
      return false;
    }

    setNotifications((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        message,
        image: image || null,
        link: link || null,
        timestamp: Date.now(),
        read: false,
      },
      ...prev,
    ]);

    if (dedupeKey) {
      markNotified(dedupeKey);
    }

    return true;
  };

  // // Check Watchlist for Coming Soon, Now Available, and New Episodes
  // useEffect(() => {
  //   const checkWatchlist = async () => {
  //     try {
  //       const storedWatchlist = localStorage.getItem(
  //         "cinevault_watchlist",
  //       );

  //       if (!storedWatchlist) {
  //         return;
  //       }

  //       const watchlist = JSON.parse(storedWatchlist);

  //       if (!Array.isArray(watchlist)) {
  //         return;
  //       }

  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);

  //       // ----------------------------------------
  //       // Movie / TV release notifications
  //       // ----------------------------------------

  //       watchlist.forEach((item) => {
  //         const releaseDate =
  //           item.release_date || item.first_air_date;

  //         if (!releaseDate) {
  //           return;
  //         }

  //         const date = new Date(releaseDate);

  //         if (Number.isNaN(date.getTime())) {
  //           return;
  //         }

  //         date.setHours(0, 0, 0, 0);

  //         const title = item.title || item.name;

  //         if (!title) {
  //           return;
  //         }

  //         const formattedDate = date.toLocaleDateString("en-US", {
  //           month: "long",
  //           day: "numeric",
  //           year: "numeric",
  //         });

  //         if (date > today) {
  //           addNotification({
  //             title: `${title} is coming soon`,
  //             message: `Release date: ${formattedDate}`,
  //             image: item.poster_path
  //               ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
  //               : null,
  //             link: `/${item.media_type}/${item.id}`,
  //             dedupeKey: `coming-soon-${item.media_type}-${item.id}`,
  //           });
  //         } else {
  //           addNotification({
  //             title: `${title} is now available`,
  //             message: `Released on: ${formattedDate}`,
  //             image: item.poster_path
  //               ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
  //               : null,
  //             link: `/${item.media_type}/${item.id}`,
  //             dedupeKey: `now-available-${item.media_type}-${item.id}`,
  //           });
  //         }
  //       });

  //       // ----------------------------------------
  //       // New TV episode notifications
  //       // ----------------------------------------

  //       const tvShows = watchlist.filter(
  //         (item) => item.media_type === "tv",
  //       );

  //       for (const item of tvShows) {
  //         try {
  //           const details = await getTitleDetails("tv", item.id);

  //           if (!details?.seasons?.length) {
  //             continue;
  //           }

  //           const seasons = details.seasons.filter(
  //             (season) => season.season_number > 0,
  //           );

  //           if (!seasons.length) {
  //             continue;
  //           }

  //           // Check every season rather than only the latest season.
  //           for (const season of seasons) {
  //             try {
  //               const seasonDetails = await getSeasonDetails(
  //                 item.id,
  //                 season.season_number,
  //               );

  //               if (!seasonDetails?.episodes?.length) {
  //                 continue;
  //               }

  //               const airedEpisodes =
  //                 seasonDetails.episodes.filter((episode) => {
  //                   if (!episode.air_date) {
  //                     return false;
  //                   }

  //                   const airDate = new Date(episode.air_date);

  //                   if (Number.isNaN(airDate.getTime())) {
  //                     return false;
  //                   }

  //                   airDate.setHours(0, 0, 0, 0);

  //                   return airDate <= today;
  //                 });

  //               // Every aired episode gets its own dedupe key.
  //               // This means several episodes can be detected
  //               // between checks without overwriting/skipping them.
  //               airedEpisodes.forEach((episode) => {
  //                 if (!episode.episode_number) {
  //                   return;
  //                 }

  //                 const showTitle = item.name || item.title;

  //                 if (!showTitle) {
  //                   return;
  //                 }

  //                 addNotification({
  //                   title: `${showTitle} — New episode available`,
  //                   message: `Season ${season.season_number}, Episode ${episode.episode_number}: ${episode.name}`,
  //                   image: item.poster_path
  //                     ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
  //                     : null,
  //                   link: `/tv/${item.id}`,
  //                   dedupeKey: `new-episode-${item.id}-s${season.season_number}e${episode.episode_number}`,
  //                 });
  //               });
  //             } catch (error) {
  //               console.error(
  //                 `Failed to check season ${season.season_number} for ${
  //                   item.name || item.title
  //                 }:`,
  //                 error,
  //               );
  //             }
  //           }
  //         } catch (error) {
  //           console.error(
  //             `Failed to check episodes for ${
  //               item.name || item.title
  //             }:`,
  //             error,
  //           );
  //         }
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Failed to check watchlist notifications:",
  //         error,
  //       );
  //     }
  //   };

  //   checkWatchlist();
  // }, []);

  // // ----------------------------------------
  // // Recommendations
  // // ----------------------------------------

  // useEffect(() => {
  //   const checkRecommendations = async () => {
  //     try {
  //       const storedWatchlist = localStorage.getItem(
  //         "cinevault_watchlist",
  //       );

  //       if (!storedWatchlist) {
  //         return;
  //       }

  //       const watchlist = JSON.parse(storedWatchlist);

  //       if (!Array.isArray(watchlist) || !watchlist.length) {
  //         return;
  //       }

  //       const recommendations = [];

  //       for (const item of watchlist) {
  //         try {
  //           const details = await getTitleDetails(
  //             item.media_type,
  //             item.id,
  //           );

  //           if (!details?.recommendations?.results?.length) {
  //             continue;
  //           }

  //           const recommendation =
  //             details.recommendations.results.find((result) => {
  //               const alreadyInWatchlist = watchlist.some(
  //                 (watchlistItem) =>
  //                   watchlistItem.id === result.id &&
  //                   watchlistItem.media_type === result.media_type,
  //               );

  //               return !alreadyInWatchlist;
  //             });

  //           if (!recommendation) {
  //             continue;
  //           }

  //           recommendations.push({
  //             sourceTitle: item.title || item.name,
  //             recommendation,
  //           });

  //           if (recommendations.length >= 3) {
  //             break;
  //           }
  //         } catch (error) {
  //           console.error(
  //             `Failed to get recommendations for ${
  //               item.title || item.name
  //             }:`,
  //             error,
  //           );
  //         }
  //       }

  //       recommendations.forEach(
  //         ({ sourceTitle, recommendation }) => {
  //           const recommendedTitle =
  //             recommendation.title || recommendation.name;

  //           if (!recommendedTitle) {
  //             return;
  //           }

  //           addNotification({
  //             title: `You might like ${recommendedTitle}`,
  //             message: `Because ${sourceTitle} is in your Watchlist`,
  //             image: recommendation.poster_path
  //               ? `https://image.tmdb.org/t/p/w342${recommendation.poster_path}`
  //               : null,
  //             link: `/${recommendation.media_type}/${recommendation.id}`,
  //             dedupeKey: `recommendation-${recommendation.id}`,
  //           });
  //         },
  //       );
  //     } catch (error) {
  //       console.error(
  //         "Failed to check watchlist recommendations:",
  //         error,
  //       );
  //     }
  //   };

  //   checkRecommendations();
  // }, []);

  // // ----------------------------------------
  // // New Releases
  // // ----------------------------------------

  // useEffect(() => {
  //   const checkNewReleases = async () => {
  //     try {
  //       const storedWatchlist = localStorage.getItem(
  //         "cinevault_watchlist",
  //       );

  //       const watchlist = storedWatchlist
  //         ? JSON.parse(storedWatchlist)
  //         : [];

  //       if (!Array.isArray(watchlist)) {
  //         return;
  //       }

  //       const releases = await getNewReleases();

  //       if (!Array.isArray(releases) || !releases.length) {
  //         return;
  //       }

  //       const newReleases = releases.filter((item) => {
  //         const alreadyInWatchlist = watchlist.some(
  //           (watchlistItem) =>
  //             watchlistItem.id === item.id &&
  //             watchlistItem.media_type === item.media_type,
  //         );

  //         return !alreadyInWatchlist;
  //       });

  //       newReleases.slice(0, 3).forEach((item) => {
  //         const title = item.title || item.name;

  //         if (!title) {
  //           return;
  //         }

  //         addNotification({
  //           title: `New release: ${title}`,
  //           message: "Now available to discover on CineVault",
  //           image: item.poster_path
  //             ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
  //             : null,
  //           link: `/${item.media_type}/${item.id}`,
  //           dedupeKey: `new-release-${item.id}`,
  //         });
  //       });
  //     } catch (error) {
  //       console.error("Failed to check new releases:", error);
  //     }
  //   };

  //   checkNewReleases();
  // }, []);

  /*
    CineVault system notification test

    Keep disabled until the notification specification
    and production implementation are finalized.

    useEffect(() => {
      addNotification({
        title: "CineVault Update",
        message:
          "Notifications are now available! You can now stay updated with your Watchlist and favorite titles.",
        image: null,
        link: "/notifications",
      });
    }, []);
  */

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter(
    (n) => !n.read,
  ).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
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
      "useNotifications must be used within the NotificationsProvider",
    );
  }

  return context;
}