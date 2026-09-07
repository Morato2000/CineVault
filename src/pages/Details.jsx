import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  IoHeart,
  IoHeartOutline,
  IoShareSocialOutline,
  IoEllipsisHorizontal,
  IoPlay,
  IoCheckmark,
  IoAddOutline,
  IoChevronDown,
  IoStar,
  IoStarOutline,
  IoFilm,
  IoTime,
  IoCheckmarkCircleOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoFilmOutline,
  IoAlbumsOutline,
  IoBookOutline,
  IoClose,
  IoCopyOutline,
  IoOpenOutline,
} from "react-icons/io5";
import { FaXTwitter, FaWhatsapp, FaFacebook } from "react-icons/fa6";
import MovieSection from "../components/movies/MovieSection";
import PosterFallback from "../components/common/PosterFallback";
import Toast from "../components/common/Toast";
import { getTmdbImage } from "../utils/tmdbImage";
import { getTitleDetails, addTvDetails } from "../services/tmdb";
import { useWatchlist } from "../context/WatchlistContext";
import { useFavorites } from "../context/FavoritesContext";
import { getGenreColor, hexToRgba } from "../constants/genreColors";
import BackButton from "../components/common/BackButton";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2.5 text-gray-300">
        <Icon className="h-4 w-4 shrink-0 text-purple-400" />
        {label}
      </dt>
      <dd className="text-right font-bold text-white">{value}</dd>
    </div>
  );
}
function getCastList(data, mediaType) {
  if (mediaType === "tv") {
    return (data.aggregate_credits?.cast || []).map((c) => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path,
      character: c.roles?.[0]?.character || "",
    }));
  }
  return data.credits?.cast || [];
}
function Details() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();

  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { isFavorited, toggleFavorite, getRating, setRating } = useFavorites();

  const [data, setData] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

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

  // Enrich recommendations with status/last_air_date the same way every other
  // TV list in the app does — the recommendations endpoint alone doesn't
  // include those fields, which was causing "Ongoing" to show even for
  // shows that have actually ended.
  useEffect(() => {
    if (!data) return;

    const raw = (data.recommendations?.results || [])
      .slice(0, 12)
      .map((r) => ({ ...r, media_type: mediaType }));

    if (mediaType === "tv") {
      addTvDetails(raw).then(setRecommended);
    } else {
      setRecommended(raw);
    }
  }, [data, mediaType]);

  if (loading) {
    return (
      <div className="px-8 pb-12">
        <div className="h-96 w-full animate-pulse rounded-2xl bg-[#111827]" />

        <div className="mt-16 h-6 w-1/3 animate-pulse rounded bg-[#111827]" />

        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#111827]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-8 pb-12 text-center">
        <p className="mt-16 text-gray-400">
          Couldn't load this title right now.
        </p>

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

  const startYear = (data.release_date || data.first_air_date || "").slice(
    0,
    4,
  );

  const endYear =
    mediaType === "tv" && data.status === "Ended"
      ? (data.last_air_date || "").slice(0, 4)
      : "";

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
    status: data.status,
    last_air_date: data.last_air_date,
    genre_ids: data.genres?.map((g) => g.id) || [],
    original_language: data.original_language,
    origin_country: data.origin_country,
  };

  const inWatchlist = isInWatchlist(data.id, mediaType);
  const favorited = isFavorited(data.id, mediaType);
  const myRating = getRating(data.id, mediaType);

  const overview = data.overview || "";
  const overviewIsLong = overview.length > 260;

  const displayedOverview =
    !showFullOverview && overviewIsLong
      ? `${overview.slice(0, 260)}...`
      : overview;

  const cast = getCastList(data, mediaType).slice(0, 3);

  const trailer =
    (data.videos?.results || []).find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
    ) ||
    (data.videos?.results || []).find(
      (v) => v.site === "YouTube" && v.type === "Trailer",
    );

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${data.id}`;

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setToast(true);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: shareUrl }).catch(() => {});
      setShareMenuOpen(false);
    } else {
      setShareMenuOpen((v) => !v);
    }
  };

  return (
    <div className="px-8 pb-16">
      {/* Hero */}
      <div className="relative">
        <div className="relative h-96 overflow-hidden rounded-2xl">
          {backdrop ? (
            <img
              src={backdrop}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <PosterFallback title={title} className="absolute inset-0" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-[#080D17]/60 via-[#080D17]/40 to-black/30" />

         <BackButton className="absolute left-6 top-6" />

          {/* Top-right icon + label actions */}
          <div className="absolute right-6 top-6 flex items-start gap-6">
            <button
              type="button"
              onClick={() => toggleFavorite(item)}
              className="flex flex-col items-center gap-1.5 text-xs font-medium text-white"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                  favorited ? "border-red-500/60" : "border-white/30"
                }`}
              >
                {favorited ? (
                  <IoHeart className="h-5 w-5 text-red-500" />
                ) : (
                  <IoHeartOutline className="h-5 w-5" />
                )}
              </span>

              {favorited ? "Favorited" : "Favorite"}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-1.5 text-xs font-medium text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30">
                  <IoShareSocialOutline className="h-5 w-5" />
                </span>
                Share
              </button>

              {shareMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShareMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-14 z-20 w-52 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        title,
                      )}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                    >
                      <FaXTwitter className="h-4 w-4" />
                      Share on X
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `${title} ${shareUrl}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                    >
                      <FaWhatsapp className="h-4 w-4" />
                      Share on WhatsApp
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        shareUrl,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                    >
                      <FaFacebook className="h-4 w-4" />
                      Share on Facebook
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        handleCopyLink(shareUrl);
                        setShareMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                    >
                      <IoCopyOutline className="h-4 w-4" />
                      Copy Link
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className="flex flex-col items-center gap-1.5 text-xs font-medium text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30">
                  <IoEllipsisHorizontal className="h-5 w-5" />
                </span>
                More
              </button>

              {moreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMoreMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-14 z-20 w-52 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40">
                    <button
                      type="button"
                      onClick={() => {
                        handleCopyLink(shareUrl);
                        setMoreMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                    >
                      <IoCopyOutline className="h-4 w-4" />
                      Copy Link
                    </button>

                    <a
                      href={tmdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 hover:text-white"
                    >
                      <IoOpenOutline className="h-4 w-4" />
                      View on TMDB
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title + genres + stats + action buttons */}
          <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-6 pl-42">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {data.genres?.slice(0, 3).map((g) => {
                  const color = getGenreColor(g.name);

                  return (
                    <span
                      key={g.id}
                      className="rounded-full px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md"
                      style={{
                        backgroundColor: hexToRgba(color, 0.3),
                        border: `1px solid ${hexToRgba(color, 0.8)}`,
                      }}
                    >
                      {g.name}
                    </span>
                  );
                })}

                {startYear && (
                  <span className="text-sm text-gray-300">
                    • {startYear}
                    {mediaType === "tv" && (
                      <> - {data.status === "Ended" ? endYear : "Ongoing"}</>
                    )}
                  </span>
                )}
              </div>

              {/* Personal rating */}
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = (hoverRating || myRating) >= n;

                  return (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(item, myRating === n ? 0 : n)}
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      className="text-amber-400"
                    >
                      {filled ? (
                        <IoStar className="h-5 w-5" />
                      ) : (
                        <IoStarOutline className="h-5 w-5" />
                      )}
                    </button>
                  );
                })}

                {myRating > 0 && (
                  <span className="ml-1 text-xs font-medium text-gray-300">
                    Your rating: {myRating}/5
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                {rating && (
                  <span className="flex items-center gap-2 rounded-2xl bg-black/50 py-2 pl-2 pr-4 text-sm font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400">
                      <IoStar className="h-3.5 w-3.5 text-black" />
                    </span>
                    {rating}
                    <span className="font-medium text-gray-300">IMDB</span>
                  </span>
                )}

                {mediaType === "tv" && data.number_of_seasons && (
                  <span className="flex items-center gap-2 rounded-2xl bg-black/50 px-4 py-2 text-sm font-bold text-white">
                    <IoFilm className="h-4 w-4 text-[#6B6DF6]" />
                    {data.number_of_seasons} Season
                    {data.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}

                {runtime && (
                  <span className="flex items-center gap-2 rounded-2xl bg-black/50 px-4 py-2 text-sm font-bold text-white">
                    <IoTime className="h-4 w-4 text-[#6B6DF6]" />
                    {runtime}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] p-px">
  <button
    type="button"
    onClick={() => toggleWatchlist(item)}
    className={`rounded-full px-5 py-2.5 text-sm font-semibold  text-white transition ${
      inWatchlist
        ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] "
        : "bg-[#111827] hover:bg-[#111827]/40"
    }`}
  >
    {inWatchlist ? (
      <span className="flex items-center gap-2">
        <IoCheckmark className="h-4 w-4" />
        In Watch List
      </span>
    ) : (
      <span className="flex items-center gap-2">
        <IoAddOutline className="h-4 w-4" />
        Add to Watch List
      </span>
    )}
  </button>
</div>

              <button
                type="button"
                onClick={() => trailer && setTrailerOpen(true)}
                disabled={!trailer}
                className="flex items-center gap-2 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IoPlay className="h-4 w-4" />
                Watch Trailer
              </button>
            </div>
          </div>
        </div>

        {/* Poster */}
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="absolute -bottom-8 left-6 z-10 hidden h-52 w-36 rounded-2xl object-cover shadow-2xl sm:block"
          />
        ) : (
          <PosterFallback
            title={title}
            className="absolute -bottom-8 left-6 z-10 hidden h-52 w-36 rounded-2xl shadow-2xl sm:flex"
          />
        )}
      </div>

      {/* Info grid */}
      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              className="mt-2 flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              {showFullOverview ? "Show Less" : "Show More"}

              <IoChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFullOverview ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Top Cast */}
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Top Cast</h2>

            {cast.length > 0 && (
              <Link
                to={`/${mediaType}/${id}/cast`}
                className="text-sm font-medium text-purple-400 hover:text-purple-300"
              >
                View All →
              </Link>
            )}
          </div>

          {cast.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No cast information.</p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {cast.map((actor) => {
                const photo = getTmdbImage(actor.profile_path, "w200");

                return (
                  <div key={actor.id} className="text-center">
                    {photo ? (
                      <img
                        src={photo}
                        alt={actor.name}
                        className="aspect-3/4 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-3/4 w-full items-center justify-center rounded-2xl bg-white/10 text-sm text-gray-400">
                        {actor.name.charAt(0)}
                      </div>
                    )}

                    <p className="mt-2 truncate text-sm font-bold text-white">
                      {actor.name}
                    </p>

                    <p className="text-[10px] font-bold uppercase tracking-wide text-purple-400">
                      As
                    </p>

                    <p className="truncate text-xs text-gray-400">
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
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Information</h2>

            <Link
              to={`/${mediaType}/${id}/info`}
              className="text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              View All →
            </Link>
          </div>

          <dl className="mt-3 space-y-3.5 text-sm">
            <InfoRow
              icon={IoCheckmarkCircleOutline}
              label="Status"
              value={data.status || "N/A"}
            />

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

                <InfoRow
                  icon={IoCalendarOutline}
                  label="First Aired"
                  value={data.first_air_date || "N/A"}
                />

                <InfoRow
                  icon={IoCalendarOutline}
                  label="Last Aired"
                  value={data.last_air_date || "N/A"}
                />

                <InfoRow
                  icon={IoFilmOutline}
                  label="Episodes"
                  value={data.number_of_episodes ?? "N/A"}
                />

                <InfoRow
                  icon={IoAlbumsOutline}
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
                  icon={IoFilmOutline}
                  label="Runtime"
                  value={runtime || "N/A"}
                />
              </>
            )}

            <InfoRow
              icon={IoBookOutline}
              label="Genres"
              value={data.genres?.map((g) => g.name).join(", ") || "N/A"}
            />
          </dl>
        </div>
      </div>

      {recommended.length > 0 && (
        <MovieSection
          title="You May Also Like"
          movies={recommended}
          viewAllPath="/explore"
          autoScroll
        />
      )}

      {/* Trailer modal */}
      {trailerOpen && trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div
            className="absolute inset-0"
            onClick={() => setTrailerOpen(false)}
          />

          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setTrailerOpen(false)}
              aria-label="Close trailer"
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <IoClose className="h-5 w-5" />
            </button>

            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      <Toast
        message="Link copied to clipboard!"
        show={toast}
        onClose={() => setToast(false)}
      />
    </div>
  );
}

export default Details;
