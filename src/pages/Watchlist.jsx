import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  IoBookmarkOutline,
  IoGrid,
  IoList,
  IoChevronDown,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import MovieCard from "../components/movies/MovieCard";
import { getTmdbImage } from "../utils/tmdbImage";
import { useWatchlist } from "../context/WatchlistContext";
import { usePreferences } from "../context/PreferencesContext";
const FILTERS = ["All", "Anime", "Movies", "TV Series"];
const SORT_OPTIONS = ["Recently Added", "Highest Rated", "A-Z"];
const PAGE_SIZE = 12;

function isAnime(item) {
  const isAnimation = item.genre_ids?.includes(16);
  const isJapanese =
    item.original_language === "ja" || item.origin_country?.includes("JP");
  return isAnimation && isJapanese;
}

function matchesFilter(item, filter) {
  if (filter === "All") return true;
  if (filter === "Anime") return isAnime(item);
  if (filter === "Movies") return item.media_type === "movie" && !isAnime(item);
  if (filter === "TV Series") return item.media_type === "tv" && !isAnime(item);
  return true;
}

function sortItems(items, sortBy) {
  const list = [...items];

  if (sortBy === "Highest Rated") {
    return list.sort((a, b) => b.vote_average - a.vote_average);
  }
  if (sortBy === "A-Z") {
    return list.sort((a, b) =>
      (a.title || a.name).localeCompare(b.title || b.name),
    );
  }
  return list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
}

function Watchlist() {
  const { items, loading } = useWatchlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const { preferences } = usePreferences();

  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState(preferences.defaultSort);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState(preferences.defaultView);

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", nextPage);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = sortItems(
    items.filter((item) => matchesFilter(item, activeFilter)),
    sortBy,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page < 1 || page > totalPages) {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(Math.min(Math.max(page, 1), totalPages)));
      setSearchParams(next);
    }
  }, [page, totalPages, searchParams, setSearchParams]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startIndex = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
      <p className="mt-1 text-gray-400">
        All the show and movies you want to watch
      </p>

      {items.length > 0 && (
        <div className="mt-5 flex items-center gap-2">
          {/* Filters */}
          <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5 sm:flex sm:w-auto sm:flex-none sm:gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  goToPage(1);
                }}
                className={`min-w-0 whitespace-nowrap rounded-full px-1 py-2 text-[10px] font-semibold transition-colors sm:px-5 sm:py-2 sm:text-sm ${
                  activeFilter === filter
                    ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
                    : "border border-[#477DF7]/70 text-gray-200 hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortMenuOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-[#477DF7]/70 px-2 py-2 text-[10px] font-medium text-gray-200 hover:bg-white/10 sm:gap-2 sm:px-4 sm:text-sm"
            >
              Sort
              <IoChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            {sortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortMenuOpen(false)}
                />
                <div className="animate-pop absolute right-0 z-20 mt-2 w-44 origin-top-right rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSortBy(option);
                        setSortMenuOpen(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                        sortBy === option
                          ? "bg-white/10 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Grid / List */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
                viewMode === "grid"
                  ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
                  : "border border-[#477DF7]/70 text-gray-300 hover:bg-white/10"
              }`}
            >
              <IoGrid className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
                viewMode === "list"
                  ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
                  : "border border-[#477DF7]/70 text-gray-300 hover:bg-white/10"
              }`}
            >
              <IoList className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-[60vh] flex-col">
        <div className="flex-1">
          {loading ? (
            <div className="mt-16 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                <IoBookmarkOutline className="h-10 w-10 text-purple-400" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Your watchlist is empty
              </h2>

              <p className="mt-2 max-w-md text-gray-400">
                Start adding movies and shows to your watchlist to keep track of
                what you want to watch.
              </p>

              <Link
                to="/explore"
                className="mt-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                Explore titles
              </Link>
            </div>
          ) : null}

          {items.length > 0 && pageItems.length === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <p className="text-gray-400">No titles match this filter.</p>
            </div>
          )}

          {pageItems.length > 0 && viewMode === "grid" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`grid-${activeFilter}-${sortBy}-${page}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:mt-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
              >
                {pageItems.map((movie, index) => (
                  <motion.div
                    key={`${movie.media_type}-${movie.id}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}
                  >
                    <MovieCard movie={movie} size="sm" />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {pageItems.length > 0 && viewMode === "list" && (
            <div className="mt-8 space-y-3">
              {pageItems.map((item) => {
                const title = item.title || item.name;
                const date = item.release_date || item.first_air_date;
                const year = date ? date.slice(0, 4) : "";
                const poster = getTmdbImage(item.poster_path, "w154");

                return (
                  <motion.div
                    key={`${item.media_type}-${item.id}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0B0F1A] p-3"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt=""
                        className="h-20 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-14 shrink-0 rounded-lg bg-white/10" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {title}
                      </p>
                      <p className="text-sm text-gray-400">
                        {year} •{" "}
                        {item.media_type === "tv" ? "TV Series" : "Movies"}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-sm text-amber-400">
                      ★ {item.vote_average?.toFixed(1)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {pageItems.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-4 sm:relative sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <p className="w-full text-center text-sm text-gray-400 sm:min-w-0 sm:flex-1 sm:text-left">
              Showing {startIndex} to {endIndex} of {filtered.length} items
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <motion.button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                whileHover={page > 1 ? { scale: 1.06 } : undefined}
                whileTap={page > 1 ? { scale: 0.94 } : undefined}
                transition={{ duration: 0.15 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#477DF7]/70 text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <IoChevronBack className="h-4 w-4" />
              </motion.button>

              {(() => {
                const getVisiblePages = () => {
                  if (totalPages <= 5) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1);
                  }

                  if (page <= 3) {
                    return [1, 2, 3, 4, "...", totalPages];
                  }

                  if (page >= totalPages - 2) {
                    return [
                      1,
                      "...",
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                      totalPages,
                    ];
                  }

                  return [
                    1,
                    "...",
                    page - 1,
                    page,
                    page + 1,
                    "...",
                    totalPages,
                  ];
                };

                return getVisiblePages().map((num, index) =>
                  num === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 w-6 items-center justify-center text-gray-500"
                    >
                      …
                    </span>
                  ) : (
                    <motion.button
                      key={num}
                      type="button"
                      onClick={() => goToPage(num)}
                      aria-current={num === page ? "page" : undefined}
                      aria-label={`Go to page ${num}`}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.15 }}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
                        num === page
                          ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
                          : "border border-[#477DF7]/70 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {num}
                    </motion.button>
                  ),
                );
              })()}

              <motion.button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
                whileHover={page < totalPages ? { scale: 1.06 } : undefined}
                whileTap={page < totalPages ? { scale: 0.94 } : undefined}
                transition={{ duration: 0.15 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#477DF7]/70 text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <IoChevronForward className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
