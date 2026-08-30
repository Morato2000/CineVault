import { useEffect, useMemo, useState } from "react";
import { IoFlame, IoStar, IoOptionsOutline } from "react-icons/io5";
import MovieSection from "../components/movies/MovieSection";
import { getTrendingAllToday, getTopRatedAll } from "../services/tmdb";

const FILTERS = ["All", "Anime", "Movies", "TV Series"];

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

function Explore() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingData, topRatedData] = await Promise.all([
          getTrendingAllToday(),
          getTopRatedAll(),
        ]);

        setTrending(trendingData);
        setTopRated(topRatedData);
      } catch (error) {
        console.error("Failed to load explore data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredTrending = useMemo(
    () => trending.filter((item) => matchesFilter(item, activeFilter)),
    [trending, activeFilter]
  );

  const filteredTopRated = useMemo(
    () => topRated.filter((item) => matchesFilter(item, activeFilter)),
    [topRated, activeFilter]
  );

  return (
    <div className="px-8 pb-12">
      <h1 className="text-2xl font-bold text-white">Explore</h1>
      <p className="mt-1 text-gray-400">Discover Movies, Anime and Tv series</p>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              activeFilter === filter
                ? "bg-gradient-to-b from-[#A855F7] to-[#3B82F6] text-white"
                : "border border-[#477DF7]/70 text-gray-200 hover:bg-white/10"
            }`}
          >
            {filter}
          </button>
        ))}

        <button
          type="button"
          className="ml-auto flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-5 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
        >
          <IoOptionsOutline className="h-4 w-4" />
          Filter
        </button>
      </div>

      <MovieSection
        title="Trending Today"
        movies={filteredTrending}
        icon={IoFlame}
        iconClass="text-orange-500"
        loading={loading}
      />

      <MovieSection
        title="Top Rated Shows"
        movies={filteredTopRated}
        icon={IoStar}
        iconClass="text-amber-400"
        loading={loading}
      />
    </div>
  );
}

export default Explore;