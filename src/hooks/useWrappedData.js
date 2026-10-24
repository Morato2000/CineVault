  import { useEffect, useMemo, useState } from "react";
  import { useWatchlist } from "../context/WatchlistContext";
  import { useFavorites } from "../context/FavoritesContext";
  import { getTitleDetails } from "../services/tmdb";
  import { GENRE_ID_TO_NAME } from "../constants/genreNames";
  import { getGenreColor } from "../constants/genreColors";

  const GENRE_VIBES = {
    Action: "Thrill Seeker",
    Adventure: "Explorer",
    Comedy: "Mood Lifter",
    Drama: "Deep Feeler",
    Horror: "Fearless",
    Romance: "Hopeless Romantic",
    "Science Fiction": "Dreamer",
    Fantasy: "Dreamer",
    Thriller: "Edge of Your Seat",
    Crime: "Detective",
    Mystery: "Detective",
    Animation: "Big Kid at Heart",
    Documentary: "Truth Seeker",
    Family: "Heartwarmer",
    War: "History Buff",
    Western: "Classic Soul",
    Music: "Rhythm Chaser",
    History: "History Buff",
  };

  function getVibe(genreName) {
    return GENRE_VIBES[genreName] || "Cinephile";
  }

  function isWithin(timestamp, start, end) {
    return timestamp >= start.getTime() && timestamp <= end.getTime();
  }

  function formatRuntime(minutes) {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) return `${days}d ${remHours}h`;
    return `${hours}h ${minutes % 60}m`;
  }

  export function useWrappedData(period, referenceDate = new Date()) {
    const { items: watchlistItems } = useWatchlist();
    const { items: favoriteItems } = useFavorites();
    const [totalMinutes, setTotalMinutes] = useState(null);

    const { start, end, label } = useMemo(() => {
      const now = new Date(referenceDate);
      if (period === "monthly") {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return {
          start: s,
          end: e,
          label: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
        };
      }
      const s = new Date(now.getFullYear(), 0, 1);
      const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { start: s, end: e, label: String(now.getFullYear()) };
    }, [period, referenceDate]);

    const periodItems = useMemo(
      () =>
        watchlistItems.filter(
          (i) => i.addedAt && isWithin(i.addedAt, start, end),
        ),
      [watchlistItems, start, end],
    );

    const periodRatings = useMemo(
      () =>
        favoriteItems.filter((i) => i.addedAt && isWithin(i.addedAt, start, end)),
      [favoriteItems, start, end],
    );

    const movieCount = periodItems.filter((i) => i.media_type === "movie").length;
    const tvCount = periodItems.filter((i) => i.media_type === "tv").length;

    const genreCounts = useMemo(() => {
      const counts = {};
      periodItems.forEach((item) => {
        (item.genre_ids || []).forEach((id) => {
          const name = GENRE_ID_TO_NAME[id];
          if (!name) return;
          counts[name] = (counts[name] || 0) + 1;
        });
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [periodItems]);

    const topGenre = genreCounts[0]?.[0] || null;
    const topGenreCount = genreCounts[0]?.[1] || 0;
    const totalGenreTags = periodItems.reduce(
      (a, i) => a + (i.genre_ids?.length || 0),
      0,
    );
    const topGenres = genreCounts.slice(0, 3).map(([name, count]) => ({
      name,
      percent: totalGenreTags ? Math.round((count / totalGenreTags) * 100) : 0,
      color: getGenreColor(name),
    }));

    const topGenrePercent = totalGenreTags
      ? Math.round((topGenreCount / totalGenreTags) * 100)
      : 0;

    const highestRatedOfPeriod = useMemo(
      () => [...periodRatings].sort((a, b) => b.rating - a.rating)[0] || null,
      [periodRatings],
    );

    const busiestMonth = useMemo(() => {
      if (period !== "yearly") return null;
      const counts = {};
      periodItems.forEach((item) => {
        const month = new Date(item.addedAt).toLocaleString("en-US", {
          month: "long",
        });
        counts[month] = (counts[month] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted[0] ? { month: sorted[0][0], count: sorted[0][1] } : null;
    }, [periodItems, period]);

    useEffect(() => {
      if (periodItems.length === 0) {
        setTotalMinutes(0);
        return;
      }

      let cancelled = false;

      Promise.all(
        periodItems.map((item) =>
          getTitleDetails(item.media_type, item.id)
            .then((d) =>
              item.media_type === "movie"
                ? d.runtime || 0
                : (d.episode_run_time?.[0] || 0) * (d.number_of_episodes || 0),
            )
            .catch(() => 0),
        ),
      ).then((results) => {
        if (!cancelled) setTotalMinutes(results.reduce((a, b) => a + b, 0));
      });

      return () => {
        cancelled = true;
      };
    }, [periodItems]);

    return {
      label,
      totalTitles: periodItems.length,
      movieCount,
      tvCount,
      topGenre,
      topGenres,
      topGenrePercent,
      topGenreColor: topGenre ? getGenreColor(topGenre) : "#7947C0",
      vibe: topGenre ? getVibe(topGenre) : "Cinephile",
      highestRatedOfPeriod,
      busiestMonth,
      totalMinutes,
      totalMinutesFormatted:
        totalMinutes === null ? null : formatRuntime(totalMinutes),
      ratedCount: periodRatings.length,
      isEmpty: periodItems.length === 0,
    };
  }
