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
  getNewReleases,
  getByGenre,
  getAnime,
  getKDrama,
  GENRES,
} from "../services/tmdb";

const FILTERS = ["All", "Anime", "Movies", "TV Series"];

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
    item.genre_ids?.includes(genre.movieId) ||
    item.genre_ids?.includes(genre.tvId)
  );
}

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = searchParams.get("type") || "All";
  const activeGenreLabel = searchParams.get("genre");
  const activeGenre = GENRES.find((g) => g.label === activeGenreLabel) || null;

  const [genreMenuOpen, setGenreMenuOpen] = useState(false);

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

  const clearAllFilters = () => setSearchParams({});

  const hasActiveFilters = activeFilter !== "All" || activeGenre !== null;

  // One direct, top-level hook call per section — order and count never change between renders.
  const trending = useExploreSection(getTrendingAllToday, activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const newReleases = useExploreSection(getNewReleases, activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const topRated = useExploreSection(getTopRatedAll, activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const anime = useExploreSection(getAnime, activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const kdrama = useExploreSection(getKDrama, activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const action = useExploreSection(() => getByGenre(28, 10759), activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const comedy = useExploreSection(() => getByGenre(35, 35), activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const horror = useExploreSection(() => getByGenre(27, 9648), activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const scifi = useExploreSection(() => getByGenre(878, 10765), activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);
  const romance = useExploreSection(() => getByGenre(10749, 10766), activeFilter, activeGenre, matchesTypeFilter, matchesGenre, []);

  const emptyMessage = hasActiveFilters
    ? "No titles match your current filters."
    : "No titles found.";

  return (
    <div className="relative px-8 pb-12">
      <h1 className="text-2xl font-bold text-white">Explore</h1>
      <p className="mt-1 text-gray-400">Discover Movies, Anime and Tv series</p>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              activeFilter === filter
                ? "bg-gradient-to-b from-[#A855F7] to-[#3B82F6] text-white"
                : "border border-[#477DF7]/70 text-gray-200 hover:bg-white/10"
            }`}
          >
            {filter}
          </button>
        ))}

        {activeGenre && (
          <button
            type="button"
            onClick={() => setActiveGenre(null)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
          >
            {activeGenre.label}
            <IoClose className="h-4 w-4" />
          </button>
        )}

        <div className="relative ml-auto">
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
                className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40"
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
                    className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
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

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
          <span>
            Showing:{" "}
            <span className="font-medium text-white">
              {[activeFilter !== "All" ? activeFilter : null, activeGenre?.label]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </span>

          <button
            type="button"
            onClick={clearAllFilters}
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Clear all
          </button>
        </div>
      )}

      <MovieSection title="Trending Today" icon={IoFlame} iconClass="text-orange-500" emptyMessage={emptyMessage} movies={trending.movies} loading={trending.loading} error={trending.error} />
      <MovieSection title="New Releases" icon={IoSparkles} iconClass="text-blue-400" emptyMessage={emptyMessage} movies={newReleases.movies} loading={newReleases.loading} error={newReleases.error} />
      <MovieSection title="Top Rated Shows" icon={IoStar} iconClass="text-amber-400" emptyMessage={emptyMessage} movies={topRated.movies} loading={topRated.loading} error={topRated.error} />
      <MovieSection title="Anime" emptyMessage={emptyMessage} movies={anime.movies} loading={anime.loading} error={anime.error} />
      <MovieSection title="K-Drama" icon={IoLanguage} iconClass="text-pink-400" emptyMessage={emptyMessage} movies={kdrama.movies} loading={kdrama.loading} error={kdrama.error} />
      <MovieSection title="Action & Adventure" icon={IoRocket} iconClass="text-red-400" emptyMessage={emptyMessage} movies={action.movies} loading={action.loading} error={action.error} />
      <MovieSection title="Comedy" emptyMessage={emptyMessage} movies={comedy.movies} loading={comedy.loading} error={comedy.error} />
      <MovieSection title="Horror" icon={IoSkull} iconClass="text-gray-300" emptyMessage={emptyMessage} movies={horror.movies} loading={horror.loading} error={horror.error} />
      <MovieSection title="Sci-Fi" icon={IoRocket} iconClass="text-cyan-400" emptyMessage={emptyMessage} movies={scifi.movies} loading={scifi.loading} error={scifi.error} />
      <MovieSection title="Romance" icon={IoHeart} iconClass="text-rose-400" emptyMessage={emptyMessage} movies={romance.movies} loading={romance.loading} error={romance.error} />
    </div>
  );
}

export default Explore;