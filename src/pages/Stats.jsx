import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoFilm,
  IoTvOutline,
  IoTimeOutline,
  IoStar,
  IoPricetagOutline,
  IoCalendarOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { useWatchlist } from "../context/WatchlistContext";
import { getTitleDetails } from "../services/tmdb";
import { getTmdbImage } from "../utils/tmdbImage";
import { getGenreColor } from "../constants/genreColors";
import { GENRE_ID_TO_NAME } from "../constants/genreNames";
import { formatRelativeTime } from "../utils/formatRelativeTime";

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}26`, color: accent }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {sub && <p className="mt-1 text-xs font-medium text-purple-400">{sub}</p>}
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Icon className="h-4 w-4 text-purple-400" />
        {label}
      </div>
      <p className="mt-2 truncate text-lg font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function formatRuntime(totalMinutes) {
  if (!totalMinutes) return "0 Hours";
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours} Hours`;
}

function Stats() {
  const { items } = useWatchlist();
  const [totalMinutes, setTotalMinutes] = useState(null);

  const movies = useMemo(() => items.filter((i) => i.media_type === "movie"), [items]);
  const series = useMemo(() => items.filter((i) => i.media_type === "tv"), [items]);

  const avgRating = useMemo(() => {
    if (items.length === 0) return null;
    const sum = items.reduce((acc, i) => acc + (i.vote_average || 0), 0);
    return (sum / items.length).toFixed(1);
  }, [items]);

  const genreBreakdown = useMemo(() => {
    const counts = {};
    let total = 0;

    items.forEach((item) => {
      (item.genre_ids || []).forEach((id) => {
        const name = GENRE_ID_TO_NAME[id];
        if (!name) return;
        counts[name] = (counts[name] || 0) + 1;
        total += 1;
      });
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const otherCount = sorted.slice(6).reduce((acc, [, c]) => acc + c, 0);

    const slices = top.map(([name, count]) => ({
      name,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
      color: getGenreColor(name),
    }));

    if (otherCount > 0) {
      slices.push({
        name: "Others",
        count: otherCount,
        percent: total ? Math.round((otherCount / total) * 100) : 0,
        color: "#6E727D",
      });
    }

    return slices;
  }, [items]);

  const highestRated = useMemo(
    () =>
      [...items]
        .filter((i) => i.vote_average)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 5),
    [items]
  );

  const recentlyAdded = useMemo(
    () => [...items].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 5),
    [items]
  );

  const oldestTitle = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "9999";
      const dateB = b.release_date || b.first_air_date || "9999";
      return dateA.localeCompare(dateB);
    })[0];
  }, [items]);

  const newestAdded = recentlyAdded[0];
  const topRatedTitle = highestRated[0];
  const favoriteGenre = genreBreakdown[0];

  useEffect(() => {
    if (items.length === 0) {
      setTotalMinutes(0);
      return;
    }

    let cancelled = false;

    Promise.all(
      items.map((item) =>
        getTitleDetails(item.media_type, item.id)
          .then((details) => {
            if (item.media_type === "movie") {
              return details.runtime || 0;
            }
            const perEpisode = details.episode_run_time?.[0] || 0;
            return perEpisode * (details.number_of_episodes || 0);
          })
          .catch(() => 0)
      )
    ).then((results) => {
      if (!cancelled) {
        setTotalMinutes(results.reduce((a, b) => a + b, 0));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div className="px-8 pb-16">
      <h1 className="text-2xl font-bold text-white">My Stats</h1>
      <p className="mt-1 text-gray-400">Insights from your watchlist collection.</p>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="text-gray-400">
            Your watchlist is empty — add titles to see your stats here.
          </p>
          <Link
            to="/explore"
            className="mt-4 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Explore Titles
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={IoFilm} label="Movies" value={movies.length} accent="#562EE6" />
            <StatCard icon={IoTvOutline} label="TV Series" value={series.length} accent="#3458E0" />
            <StatCard
              icon={IoTimeOutline}
              label="Watch Time"
              value={totalMinutes === null ? "..." : formatRuntime(totalMinutes)}
              accent="#59A3A7"
            />
            <StatCard
              icon={IoStar}
              label="Avg. Rating"
              value={avgRating ? `${avgRating}/10` : "N/A"}
              accent="#E2B637"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
              <h2 className="font-bold text-white">Genre Breakdown</h2>
              <p className="text-xs text-gray-500">Based on all titles in your watchlist</p>

              <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                <div
                  className="relative h-44 w-44 shrink-0 rounded-full"
                  style={{
                    background: `conic-gradient(${genreBreakdown
                      .reduce(
                        (acc, slice) => {
                          const start = acc.total;
                          const end = start + slice.percent;
                          acc.parts.push(`${slice.color} ${start}% ${end}%`);
                          acc.total = end;
                          return acc;
                        },
                        { parts: [], total: 0 }
                      )
                      .parts.join(", ")})`,
                  }}
                >
                  <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-[#0B0F1A]">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-white">{items.length}</span>
                    <span className="text-xs text-purple-400">Titles</span>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  {genreBreakdown.map((slice) => (
                    <div key={slice.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-300">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: slice.color }}
                        />
                        {slice.name}
                      </span>
                      <span className="font-semibold text-white">{slice.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
              <h2 className="font-bold text-white">Highest Rated Titles</h2>
              <p className="text-xs text-gray-500">Top titles in your watchlist</p>

              <div className="mt-4 space-y-3">
                {highestRated.map((item, index) => {
                  const title = item.title || item.name;
                  const poster = getTmdbImage(item.poster_path, "w92");
                  const year = (item.release_date || item.first_air_date || "").slice(0, 4);

                  return (
                    <Link
                      key={`${item.media_type}-${item.id}`}
                      to={`/${item.media_type}/${item.id}`}
                      className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-white/5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-300">
                        {index + 1}
                      </span>
                      {poster ? (
                        <img src={poster} alt="" className="h-12 w-9 rounded-md object-cover" />
                      ) : (
                        <div className="h-12 w-9 shrink-0 rounded-md bg-white/10" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs text-gray-400">{year}</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-bold text-amber-400">
                        <IoStar className="h-4 w-4" /> {item.vote_average?.toFixed(1)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">Recently Added</h2>
                <Link to="/watchlist" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                  View All →
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentlyAdded.map((item) => {
                  const title = item.title || item.name;
                  const poster = getTmdbImage(item.poster_path, "w92");

                  return (
                    <Link
                      key={`${item.media_type}-${item.id}`}
                      to={`/${item.media_type}/${item.id}`}
                      className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-white/5"
                    >
                      {poster ? (
                        <img src={poster} alt="" className="h-12 w-9 rounded-md object-cover" />
                      ) : (
                        <div className="h-12 w-9 shrink-0 rounded-md bg-white/10" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{title}</p>
                        <p className="text-xs text-gray-400">
                          {item.media_type === "tv" ? "TV Series" : "Movie"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-purple-400">
                        {formatRelativeTime(item.addedAt)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
              <h2 className="font-bold text-white">Collection Insights</h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <InsightCard
                  icon={IoPricetagOutline}
                  label="Favorite Genre"
                  value={favoriteGenre?.name || "N/A"}
                  sub={favoriteGenre ? `${favoriteGenre.percent}% of your collection` : null}
                />
                <InsightCard
                  icon={IoCalendarOutline}
                  label="Oldest Title"
                  value={oldestTitle?.title || oldestTitle?.name || "N/A"}
                  sub={(oldestTitle?.release_date || oldestTitle?.first_air_date || "").slice(0, 4)}
                />
                <InsightCard
                  icon={IoSparklesOutline}
                  label="Newest Title"
                  value={newestAdded?.title || newestAdded?.name || "N/A"}
                  sub={formatRelativeTime(newestAdded?.addedAt)}
                />
                <InsightCard
                  icon={IoStar}
                  label="Highest Rated"
                  value={topRatedTitle?.title || topRatedTitle?.name || "N/A"}
                  sub={topRatedTitle ? `★ ${topRatedTitle.vote_average?.toFixed(1)}` : null}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;