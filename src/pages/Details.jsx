import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  IoArrowBack,
  IoHeart,
  IoHeartOutline,
  IoShareSocialOutline,
  IoEllipsisHorizontal,
  IoPlay,
  IoCheckmark,
  IoCheckmarkCircleOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import MovieSection from "../components/movies/MovieSection";
import PosterFallback from "../components/common/PosterFallback";
import { getTmdbImage } from "../utils/tmdbImage";
import { getTitleDetails } from "../services/tmdb";
import { useWatchlist } from "../context/WatchlistContext";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-gray-400">
        <Icon className="h-4 w-4 shrink-0 text-purple-400" />
        {label}
      </dt>
      <dd className="text-right font-medium text-white">{value}</dd>
    </div>
  );
}

function Details() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0 });

    getTitleDetails(mediaType, id)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mediaType, id]);

  if (loading) {
    return (
      <div className="px-8 pb-12">
        <div className="h-80 w-full animate-pulse rounded-2xl bg-[#111827]" />
        <div className="mt-16 h-6 w-1/3 animate-pulse rounded bg-[#111827]" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#111827]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-8 pb-12 text-center">
        <p className="mt-16 text-gray-400">Couldn't load this title right now.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-purple-400 hover:text-purple-300"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const title = data.title || data.name;
  const backdrop = getTmdbImage(data.backdrop_path, "original");
  const poster = getTmdbImage(data.poster_path, "w342");
  const year = (data.release_date || data.first_air_date || "").slice(0, 4);
  const rating = data.vote_average?.toFixed(1);
  const runtime = data.runtime
    ? `${data.runtime} Mins`
    : data.episode_run_time?.[0]
    ? `${data.episode_run_time[0]} Mins Per Episode`
    : null;

  const item = {
    id: data.id,
    media_type: mediaType,
    title: data.title,
    name: data.name,
    poster_path: data.poster_path,
    release_date: data.release_date,
    first_air_date: data.first_air_date,
    vote_average: data.vote_average,
    genre_ids: data.genres?.map((g) => g.id) || [],
    original_language: data.original_language,
    origin_country: data.origin_country,
  };

  const inWatchlist = isInWatchlist(data.id, mediaType);

  const overview = data.overview || "";
  const overviewIsLong = overview.length > 260;
  const displayedOverview =
    !showFullOverview && overviewIsLong ? `${overview.slice(0, 260)}...` : overview;

  const cast = data.credits?.cast?.slice(0, 3) || [];
  const recommended = (data.recommendations?.results || [])
    .slice(0, 12)
    .map((r) => ({ ...r, media_type: mediaType }));

  return (
    <div className="px-8 pb-16">
      {/* Hero */}
      <div className="relative">
        <div className="relative h-80 overflow-hidden rounded-2xl">
          {backdrop ? (
            <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <PosterFallback title={title} className="absolute inset-0" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#080D17] via-[#080D17]/50 to-black/40" />

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300"
          >
            <IoArrowBack className="h-4 w-4" />
            Back
          </button>

          <div className="absolute right-6 top-6 flex items-center gap-5">
            <button
              type="button"
              onClick={() => setFavorited((v) => !v)}
              className="flex flex-col items-center gap-1 text-xs font-medium text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
                {favorited ? (
                  <IoHeart className="h-5 w-5 text-red-500" />
                ) : (
                  <IoHeartOutline className="h-5 w-5" />
                )}
              </span>
              Favorited
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs font-medium text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
                <IoShareSocialOutline className="h-5 w-5" />
              </span>
              Share
            </button>

            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs font-medium text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60">
                <IoEllipsisHorizontal className="h-5 w-5" />
              </span>
              More
            </button>
          </div>
        </div>

        {/* Poster + title row, overlapping the hero's bottom edge */}
        <div className="relative -mt-14 flex items-end justify-between gap-6 px-6">
          <div className="flex items-end gap-5">
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="hidden h-40 w-28 rounded-xl object-cover shadow-lg sm:block"
              />
            ) : (
              <PosterFallback
                title={title}
                className="hidden h-40 w-28 rounded-xl shadow-lg sm:flex"
              />
            )}

            <div className="pb-1">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {data.genres?.slice(0, 3).map((g) => (
                  <span
                    key={g.id}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white"
                  >
                    {g.name}
                  </span>
                ))}
                {year && <span className="text-sm text-gray-300">• {year}</span>}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {rating && (
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                    ★ <span className="font-bold">{rating}</span> IMDB
                  </span>
                )}
                {mediaType === "tv" && data.number_of_seasons && (
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                    {data.number_of_seasons} Season
                    {data.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}
                {runtime && (
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                    {runtime}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 pb-1">
            <button
              type="button"
              onClick={() => toggleWatchlist(item)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white ${
                inWatchlist
                  ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6]"
                  : "border border-white/30 bg-black/40 hover:bg-white/10"
              }`}
            >
              {inWatchlist ? (
                <>
                  <IoCheckmark className="h-4 w-4" /> In Watchlist
                </>
              ) : (
                "+ Add to Watchlist"
              )}
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <IoPlay className="h-4 w-4" />
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overview */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <h2 className="font-bold text-white">Overview</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {displayedOverview || "No overview available."}
          </p>
          {overviewIsLong && (
            <button
              type="button"
              onClick={() => setShowFullOverview((v) => !v)}
              className="mt-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              {showFullOverview ? "Show Less ^" : "Show More v"}
            </button>
          )}
        </div>

        {/* Top Cast */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Top Cast</h2>
            {cast.length > 0 && (
              <span className="text-sm font-medium text-purple-400">View All →</span>
            )}
          </div>

          {cast.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No cast information.</p>
          ) : (
            <div className="mt-4 flex gap-4">
              {cast.map((actor) => {
                const photo = getTmdbImage(actor.profile_path, "w185");
                return (
                  <div key={actor.id} className="text-center">
                    {photo ? (
                      <img
                        src={photo}
                        alt={actor.name}
                        className="mx-auto h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xs text-gray-400">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                    <p className="mt-2 max-w-[80px] truncate text-xs font-medium text-white">
                      {actor.name}
                    </p>
                    <p className="max-w-[80px] truncate text-xs text-purple-400">
                      {actor.character}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Information */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <h2 className="font-bold text-white">Information</h2>

          <dl className="mt-3 space-y-3 text-sm">
            <InfoRow icon={IoCheckmarkCircleOutline} label="Status" value={data.status || "N/A"} />
            <InfoRow
              icon={IoGlobeOutline}
              label="Original Language"
              value={data.original_language?.toUpperCase() || "N/A"}
            />
            {mediaType === "tv" ? (
              <>
                <InfoRow
                  icon={IoLocationOutline}
                  label="Country"
                  value={data.origin_country?.join(", ") || "N/A"}
                />
                <InfoRow icon={IoCalendarOutline} label="First Aired" value={data.first_air_date || "N/A"} />
                <InfoRow icon={IoCalendarOutline} label="Last Aired" value={data.last_air_date || "N/A"} />
                <InfoRow
                  icon={IoInformationCircleOutline}
                  label="Episodes"
                  value={data.number_of_episodes ?? "N/A"}
                />
                <InfoRow
                  icon={IoInformationCircleOutline}
                  label="Season"
                  value={data.number_of_seasons ?? "N/A"}
                />
              </>
            ) : (
              <>
                <InfoRow
                  icon={IoCalendarOutline}
                  label="Release Date"
                  value={data.release_date || "N/A"}
                />
                <InfoRow
                  icon={IoInformationCircleOutline}
                  label="Runtime"
                  value={runtime || "N/A"}
                />
              </>
            )}
            <InfoRow
              icon={IoInformationCircleOutline}
              label="Genres"
              value={data.genres?.map((g) => g.name).join(", ") || "N/A"}
            />
          </dl>
        </div>
      </div>

      {/* Recommendations */}
      {recommended.length > 0 && (
        <MovieSection title="Similar Titles" movies={recommended} />
      )}
    </div>
  );
}

export default Details;