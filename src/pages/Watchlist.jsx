import { useState } from "react";
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
      (a.title || a.name).localeCompare(b.title || b.name)
    );
  }
  return list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
}

function Watchlist() {
  const { items } = useWatchlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recently Added");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", nextPage);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = sortItems(
    items.filter((item) => matchesFilter(item, activeFilter)),
    sortBy
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startIndex = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="px-8 pb-12">
      <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
      <p className="mt-1 text-gray-400">
        All the show and movies you want to watch
      </p>

      {items.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                goToPage(1);
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                activeFilter === filter
                  ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
                  : "border border-[#477DF7]/70 text-gray-200 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setSortMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10"
            >
              Sort by: {sortBy}
              <IoChevronDown className="h-4 w-4" />
            </button>

            {sortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSortMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40">
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
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
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
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
          {items.length === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                <IoBookmarkOutline className="h-10 w-10 text-purple-400" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">
                Your watchlist is empty
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Titles you add will show up here.
              </p>
              <Link
                to="/explore"
                className="mt-5 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-6 py-2.5 text-sm font-semibold text-white"
              >
                Explore Titles
              </Link>
            </div>
          )}

          {items.length > 0 && pageItems.length === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <p className="text-gray-400">No titles match this filter.</p>
            </div>
          )}

          {pageItems.length > 0 && viewMode === "grid" && (
            <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
              {pageItems.map((movie) => (
                <MovieCard
                  key={`${movie.media_type}-${movie.id}`}
                  movie={movie}
                  size="sm"
                />
              ))}
            </div>
          )}

          {pageItems.length > 0 && viewMode === "list" && (
            <div className="mt-8 space-y-3">
              {pageItems.map((item) => {
                const title = item.title || item.name;
                const date = item.release_date || item.first_air_date;
                const year = date ? date.slice(0, 4) : "";
                const poster = getTmdbImage(item.poster_path, "w154");

                return (
                  <div
                    key={`${item.media_type}-${item.id}`}
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
                      <p className="truncate font-semibold text-white">{title}</p>
                      <p className="text-sm text-gray-400">
                        {year} •{" "}
                        {item.media_type === "tv" ? "TV Series" : "Movies"}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-sm text-amber-400">
                      ★ {item.vote_average?.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pageItems.length > 0 && (
          <div className="relative mt-8 flex items-center justify-between">
            <p className="min-w-0 flex-1 text-left text-sm text-gray-400">
              Showing {startIndex} to {endIndex} of {filtered.length} items
            </p>

            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#477DF7]/70 text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <IoChevronBack className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => goToPage(num)}
                  aria-current={num === page ? "page" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold ${
                    num === page
                      ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white"
                      : "border border-[#477DF7]/70 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#477DF7]/70 text-gray-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <IoChevronForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;