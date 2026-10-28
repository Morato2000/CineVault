import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  IoFlame,
  IoStar,
  IoSparkles,
  IoOptionsOutline,
  IoClose,
  IoSkull,
  IoRocket,
  IoHeart,
  IoLanguage,
} from "react-icons/io5";
import MovieSection from "../components/movies/MovieSection";
import { useExploreSection } from "../hooks/useExploreSection";
import {
  getTrendingAllToday,
  getTopRatedAll,
  getTopRatedMovies,
  getTopRatedSeries,
  getNewReleases,
  getByGenre,
  getAnime,
  getKDrama,
  GENRES,
} from "../services/tmdb";

const FILTERS = ["All", "Anime", "Movies", "TV Series"];

const SORT_OPTIONS = [
  { label: "Recently Added", value: "recent" },
  { label: "Release Date", value: "release" },
  { label: "Highest Rated", value: "rating" },
  { label: "Title (A–Z)", value: "title" },
];
function isAnime(item) {
  const isAnimation = item.genre_ids?.includes(16);
  const isJapanese =
    item.original_language === "ja" || item.origin_country?.includes("JP");

  return isAnimation && isJapanese;
}

function matchesTypeFilter(item, filter) {
  if (filter === "All") return true;
  if (filter === "Anime") return isAnime(item);
  if (filter === "Movies") return item.media_type === "movie" && !isAnime(item);
  if (filter === "TV Series") return item.media_type === "tv" && !isAnime(item);
  return true;
}

function matchesGenre(item, genre) {
  if (!genre) return true;

  return (
    (genre.movieId != null && item.genre_ids?.includes(genre.movieId)) ||
    (genre.tvId != null && item.genre_ids?.includes(genre.tvId))
  );
}

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = searchParams.get("type") || "All";
  const activeGenreLabel = searchParams.get("genre");
  const activeGenre = GENRES.find((g) => g.label === activeGenreLabel) || null;

  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const setActiveFilter = (filter) => {
    const next = new URLSearchParams(searchParams);
    if (filter === "All") {
      next.delete("type");
    } else {
      next.set("type", filter);
    }
    setSearchParams(next);
  };

  const setActiveGenre = (genre) => {
    const next = new URLSearchParams(searchParams);
    if (!genre) {
      next.delete("genre");
    } else {
      next.set("genre", genre.label);
    }
    setSearchParams(next);
  };
  const sortMovies = (movies) => {
    const sorted = [...movies];

    switch (sortBy) {
      case "release":
        return sorted.sort(
          (a, b) =>
            new Date(b.release_date || b.first_air_date || 0) -
            new Date(a.release_date || a.first_air_date || 0),
        );

      case "rating":
        return sorted.sort(
          (a, b) => (b.vote_average || 0) - (a.vote_average || 0),
        );

      case "title":
        return sorted.sort((a, b) =>
          (a.title || a.name || "").localeCompare(b.title || b.name || ""),
        );

      case "recent":
      default:
        return sorted;
    }
  };
  const clearAllFilters = () => setSearchParams({});

  const hasActiveFilters = activeFilter !== "All" || activeGenre !== null;

  // One direct, top-level hook call per section — order and count never change between renders.
  const trending = useExploreSection(
    getTrendingAllToday,
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const newReleases = useExploreSection(
    getNewReleases,
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  // const topRated = useExploreSection(
  //   getTopRatedAll,
  //   activeFilter,
  //   activeGenre,
  //   matchesTypeFilter,
  //   matchesGenre,
  //   [],
  // );
  const topRatedMovies = useExploreSection(
    getTopRatedMovies,
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );

  const topRatedShows = useExploreSection(
    getTopRatedSeries,
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const anime = useExploreSection(
    getAnime,
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const kdrama = useExploreSection(
    getKDrama,
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const action = useExploreSection(
    () => getByGenre(28, 10759),
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const comedy = useExploreSection(
    () => getByGenre(35, 35),
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const mystery = useExploreSection(
    () => getByGenre(27, 9648),
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const scifi = useExploreSection(
    () => getByGenre(878, 10765),
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );
  const romance = useExploreSection(
    () => getByGenre(10749, 10766),
    activeFilter,
    activeGenre,
    matchesTypeFilter,
    matchesGenre,
    [],
  );

  const emptyMessage = hasActiveFilters
    ? "No titles match your current filters."
    : "No titles found.";

  return (
    <div className="relative px-8 pb-12">
      <h1 className="text-2xl font-bold text-white">Explore</h1>
      <p className="mt-1 text-gray-400">Discover Movies, Anime and Tv series</p>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mt-5"
      >
        {/* MOBILE FILTERS */}
        <div className="flex items-center justify-between gap-3 sm:hidden">
          {/* CONTENT TYPE DROPDOWN */}
          <div className="relative w-[120px] shrink-0">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              aria-label="Filter by content type"
              className="w-full appearance-none rounded-full border border-[#477DF7]/70 bg-[#0B0F1A] py-2.5 pl-4 pr-9 text-sm font-semibold text-gray-200 outline-none transition-colors focus:border-purple-400"
            >
              {FILTERS.map((filter) => (
                <option
                  key={filter}
                  value={filter}
                  className="bg-[#0B0F1A] text-white"
                >
                  {filter}
                </option>
              ))}
            </select>

            <IoOptionsOutline className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-300" />
          </div>

          {/* GENRE FILTER */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setGenreMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={genreMenuOpen}
              className="flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-5 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10"
            >
              <IoOptionsOutline className="h-4 w-4" />
              Filter
            </button>

            {genreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setGenreMenuOpen(false)}
                />

                <div
                  role="listbox"
                  className="animate-pop absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40"
                >
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Genre
                  </p>

                  {GENRES.map((genre) => (
                    <button
                      key={genre.label}
                      type="button"
                      role="option"
                      aria-selected={activeGenre?.label === genre.label}
                      onClick={() => {
                        setActiveGenre(genre);
                        setGenreMenuOpen(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                        activeGenre?.label === genre.label
                          ? "bg-white/10 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSortMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={sortMenuOpen}
            className="flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-3 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10"
          >
            <IoOptionsOutline className="h-4 w-4" />
            Sort
          </button>

          {sortMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortMenuOpen(false)}
              />

              <div className="animate-pop absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setSortMenuOpen(false);
                    }}
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {/* DESKTOP FILTERS — RESTORED ORIGINAL LAYOUT */}
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                  activeFilter === filter
                    ? "bg-gradient-to-b from-[#A855F7] to-[#3B82F6] text-white"
                    : "border border-[#477DF7]/70 text-gray-200 hover:bg-white/10"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <AnimatePresence>
              {activeGenre && (
                <motion.button
                  key={activeGenre.label}
                  type="button"
                  onClick={() => setActiveGenre(null)}
                  initial={{ opacity: 0, scale: 0.85, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
                >
                  {activeGenre.label}
                  <IoClose className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="relative">
              <button
                type="button"
                onClick={() => setGenreMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={genreMenuOpen}
                className="flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-5 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
              >
                <IoOptionsOutline className="h-4 w-4" />
                Filter
              </button>

              {genreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setGenreMenuOpen(false)}
                  />

                  <div
                    role="listbox"
                    className="animate-pop absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40"
                  >
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Genre
                    </p>

                    {GENRES.map((genre) => (
                      <button
                        key={genre.label}
                        type="button"
                        role="option"
                        aria-selected={activeGenre?.label === genre.label}
                        onClick={() => {
                          setActiveGenre(genre);
                          setGenreMenuOpen(false);
                        }}
                        className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                          activeGenre?.label === genre.label
                            ? "bg-white/10 text-white"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {genre.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sortMenuOpen}
                className="flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-5 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10"
              >
                <IoOptionsOutline className="h-4 w-4" />
                Sort
              </button>

              {sortMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortMenuOpen(false)}
                  />

                  <div className="animate-pop absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSortBy(option.value);
                          setSortMenuOpen(false);
                        }}
                        className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                          sortBy === option.value
                            ? "bg-white/10 text-white"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE GENRE — MOBILE */}
        <AnimatePresence>
          {activeGenre && (
            <motion.button
              key={`mobile-${activeGenre.label}`}
              type="button"
              onClick={() => setActiveGenre(null)}
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.18 }}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white sm:hidden"
            >
              {activeGenre.label}
              <IoClose className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Active filter summary */}
      <AnimatePresence mode="wait">
        {hasActiveFilters && (
          <motion.div
            key={`${activeFilter}-${activeGenre?.label || ""}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-4 flex items-center gap-3 text-sm text-gray-400"
          >
            <span>
              Showing:{" "}
              <span className="font-medium text-white">
                {[
                  activeFilter !== "All" ? activeFilter : null,
                  activeGenre?.label,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            </span>

            <motion.button
              type="button"
              onClick={clearAllFilters}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="font-medium text-purple-400 hover:text-purple-300"
            >
              Clear all
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <MovieSection
        title="Trending Today"
        icon={IoFlame}
        iconClass="text-orange-500"
        emptyMessage={emptyMessage}
        movies={sortMovies(trending.movies)}
        loading={trending.loading}
        error={trending.error}
      />
      <MovieSection
        title="New Releases"
        icon={IoSparkles}
        iconClass="text-blue-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(newReleases.movies)}
        loading={newReleases.loading}
        error={newReleases.error}
      />
      {/* <MovieSection
        title="Top Rated Shows"
        icon={IoStar}
        iconClass="text-amber-400"
        emptyMessage={emptyMessage}
        movies={topRated.movies}
        loading={topRated.loading}
        error={topRated.error}
      /> */}
      <MovieSection
        title="Top Rated Movies"
        icon={IoStar}
        iconClass="text-amber-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(topRatedMovies.movies)}
        loading={topRatedMovies.loading}
        error={topRatedMovies.error}
      />

      <MovieSection
        title="Top Rated Shows"
        icon={IoStar}
        iconClass="text-amber-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(topRatedShows.movies)}
        loading={topRatedShows.loading}
        error={topRatedShows.error}
      />
      <MovieSection
        title="Anime"
        emptyMessage={emptyMessage}
        movies={sortMovies(anime.movies)}
        loading={anime.loading}
        error={anime.error}
      />
      <MovieSection
        title="K-Drama"
        icon={IoLanguage}
        iconClass="text-pink-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(kdrama.movies)}
        loading={kdrama.loading}
        error={kdrama.error}
      />
      <MovieSection
        title="Action & Adventure"
        icon={IoRocket}
        iconClass="text-red-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(action.movies)}
        loading={action.loading}
        error={action.error}
      />
      <MovieSection
        title="Comedy"
        emptyMessage={emptyMessage}
        movies={sortMovies(comedy.movies)}
        loading={comedy.loading}
        error={comedy.error}
      />
      <MovieSection
        title="Mystery"
        icon={IoSkull}
        iconClass="text-gray-300"
        emptyMessage={emptyMessage}
        movies={sortMovies(mystery.movies)}
        loading={mystery.loading}
        error={mystery.error}
      />
      <MovieSection
        title="Sci-Fi"
        icon={IoRocket}
        iconClass="text-cyan-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(scifi.movies)}
        loading={scifi.loading}
        error={scifi.error}
      />
      <MovieSection
        title="Romance"
        icon={IoHeart}
        iconClass="text-rose-400"
        emptyMessage={emptyMessage}
        movies={sortMovies(romance.movies)}
        loading={romance.loading}
        error={romance.error}
      />
    </div>
  );
}

export default Explore;
