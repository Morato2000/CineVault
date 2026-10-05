import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import {
  IoHeart,
  IoHeartOutline,
  IoShareSocialOutline,
  IoEllipsisHorizontal,
  IoPlay,
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
  IoChevronDown,
  IoChevronBack,
  IoChevronForward,
  IoStar,
  IoFilm,
  IoTime,
} from "react-icons/io5";

import { FaXTwitter, FaWhatsapp, FaFacebook } from "react-icons/fa6";

import RatingHearts from "../components/common/RatingHearts";
import MovieSection from "../components/movies/MovieSection";
import PosterFallback from "../components/common/PosterFallback";
import Toast from "../components/common/Toast";
import BackButton from "../components/common/BackButton";

import { getTmdbImage } from "../utils/tmdbImage";

import {
  getTitleDetails,
  getSeasonDetails,
  addTvDetails,
} from "../services/tmdb";

import { useWatchlist } from "../context/WatchlistContext";
import { useFavorites } from "../context/FavoritesContext";

import { useNotifications } from "../context/NotificationsContext";

import { getGenreColor, hexToRgba } from "../constants/genreColors";

import arrowLeft from "../assets/icons/arrow-left.svg";
import arrowRight from "../assets/icons/arrow-right.svg";

// ============================================================
// CONSTANTS
// ============================================================

const EPISODES_PER_PAGE = 10;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getPageWindow(current, total, windowSize = 5) {
  if (total <= windowSize + 2)
    return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - windowSize + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

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

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

// ============================================================
// DETAILS PAGE
// ============================================================

function Details() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();

  // ============================================================
  // CONTEXT HOOKS
  // IMPORTANT: Keep ALL hooks above conditional returns.
  // ============================================================

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const { isFavorited, toggleFavorite, getRating, setRating } = useFavorites();

  const { addNotification } = useNotifications();

  // ============================================================
  // STATE — TITLE DATA
  // ============================================================

  const [data, setData] = useState(null);
  const [recommended, setRecommended] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // STATE — UI
  // ============================================================

  const [showFullOverview, setShowFullOverview] = useState(false);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const [activeVideo, setActiveVideo] = useState(null);

  const [ratingMenuOpen, setRatingMenuOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  const [expandedReviews, setExpandedReviews] = useState({});

  const [pageInput, setPageInput] = useState("");

  const [activeReview, setActiveReview] = useState(null);

  // ============================================================
  // STATE — SEASONS & EPISODES
  // ============================================================

  const [selectedSeason, setSelectedSeason] = useState(1);

  const [episodes, setEpisodes] = useState([]);

  const [episodePage, setEpisodePage] = useState(1);

  const [episodesLoading, setEpisodesLoading] = useState(false);

  //Season selector slider
  const seasonScrollRef = useRef(null);
  const [canScrollSeasonLeft, setCanScrollSeasonLeft] = useState(false);
  const [canScrollSeasonRight, setCanScrollSeasonRight] = useState(false);
  const [seasonScrollProgress, setSeasonScrollProgress] = useState(0);

  // ============================================================
  // STATE — VIDEO CAROUSEL
  // ============================================================

  const videoScrollRef = useRef(null);
  const videoRafRef = useRef(null);
  const videoPausedRef = useRef(false);
  const episodeGuideRef = useRef(null);

  const [canScrollVideosLeft, setCanScrollVideosLeft] = useState(false);

  const [canScrollVideosRight, setCanScrollVideosRight] = useState(false);

  const [videoScrollProgress, setVideoScrollProgress] = useState(0);

  const [videoAutoScroll, setVideoAutoScroll] = useState(true);

  // ============================================================
  // DATA FETCHING — TITLE DETAILS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    getTitleDetails(mediaType, id)
      .then((result) => {
        if (!cancelled) {
          setData(result);

          // Start TV shows on Season 1 when available.
          if (mediaType === "tv") {
            const firstRegularSeason = result.seasons?.find(
              (season) => season.season_number > 0,
            );

            setSelectedSeason(firstRegularSeason?.season_number ?? 1);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mediaType, id]);

  // ============================================================
  // DATA FETCHING — SEASON EPISODES
  // ============================================================

  useEffect(() => {
    if (mediaType !== "tv" || !data) {
      return;
    }

    let cancelled = false;

    setEpisodesLoading(true);

    getSeasonDetails(data.id, selectedSeason)
      .then((season) => {
        if (!cancelled) {
          setEpisodes(season.episodes || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEpisodes([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEpisodesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mediaType, data, selectedSeason]);

  // ============================================================
  // RESET EPISODE PAGE WHEN SEASON CHANGES
  // ============================================================

  useEffect(() => {
    setEpisodePage(1);
  }, [selectedSeason]);
  useEffect(() => {
    if (episodePage === 1) return;

    episodeGuideRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [episodePage]);

  // ==========================================================
  // SEASON SELECTOR SLIDER
  // ==========================================================

  const updateSeasonScrollState = useCallback(() => {
    const el = seasonScrollRef.current;

    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

    setCanScrollSeasonLeft(el.scrollLeft > 1);

    setCanScrollSeasonRight(el.scrollLeft < maxScrollLeft - 1);

    const progress =
      maxScrollLeft > 0 ? (el.scrollLeft / maxScrollLeft) * 100 : 0;

    setSeasonScrollProgress(progress);
  }, []);

  useEffect(() => {
    updateSeasonScrollState();

    const el = seasonScrollRef.current;

    if (!el) return;

    el.addEventListener("scroll", updateSeasonScrollState, { passive: true });

    window.addEventListener("resize", updateSeasonScrollState);

    return () => {
      el.removeEventListener("scroll", updateSeasonScrollState);

      window.removeEventListener("resize", updateSeasonScrollState);
    };
  }, [updateSeasonScrollState, data?.seasons]);

  const scrollSeasons = (direction) => {
    const el = seasonScrollRef.current;

    if (!el) return;

    const amount = window.innerWidth < 640 ? 220 : 400;

    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };
  // ============================================================
  // EPISODE PAGINATION
  // ============================================================

  const totalEpisodePages = Math.max(
    1,
    Math.ceil(episodes.length / EPISODES_PER_PAGE),
  );

  const pagedEpisodes = episodes.slice(
    (episodePage - 1) * EPISODES_PER_PAGE,
    episodePage * EPISODES_PER_PAGE,
  );

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  useEffect(() => {
    if (!data) {
      return;
    }

    const raw = (data.recommendations?.results || [])
      .slice(0, 12)
      .map((movie) => ({
        ...movie,
        media_type: mediaType,
      }));

    if (mediaType === "tv") {
      addTvDetails(raw).then(setRecommended);
    } else {
      setRecommended(raw);
    }
  }, [data, mediaType]);

  // ============================================================
  // VIDEO DATA
  // ============================================================

  const allVideos = (data?.videos?.results || []).filter(
    (video) => video.site === "YouTube",
  );

  // ============================================================
  // MAIN TRAILER
  // ============================================================

  const mainTrailer =
    allVideos.find((video) => video.type === "Trailer" && video.official) ||
    allVideos.find((video) => video.type === "Trailer");

  // ============================================================
  // VIDEO SCROLL STATE
  // ============================================================

  const updateVideoScrollState = useCallback(() => {
    const element = videoScrollRef.current;

    if (!element) {
      return;
    }

    const maxScrollLeft = Math.max(
      0,
      element.scrollWidth - element.clientWidth,
    );

    setCanScrollVideosLeft(element.scrollLeft > 1);

    setCanScrollVideosRight(element.scrollLeft < maxScrollLeft - 1);

    const progress =
      maxScrollLeft > 0 ? (element.scrollLeft / maxScrollLeft) * 100 : 0;

    setVideoScrollProgress(progress);
  }, []);

  // ============================================================
  // VIDEO SCROLL LISTENER
  // ============================================================

  useEffect(() => {
    updateVideoScrollState();

    const element = videoScrollRef.current;

    if (!element) {
      return;
    }

    element.addEventListener("scroll", updateVideoScrollState);

    window.addEventListener("resize", updateVideoScrollState);

    return () => {
      element.removeEventListener("scroll", updateVideoScrollState);

      window.removeEventListener("resize", updateVideoScrollState);
    };
  }, [updateVideoScrollState, allVideos]);

  // ============================================================
  // VIDEO AUTO-SCROLL
  // ============================================================

  useEffect(() => {
    if (!videoAutoScroll || allVideos.length <= 1) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const speed = 0.6;

    const step = () => {
      const element = videoScrollRef.current;

      if (!element) {
        videoRafRef.current = null;
        return;
      }

      if (!videoPausedRef.current) {
        const maxScrollLeft = Math.max(
          0,
          element.scrollWidth - element.clientWidth,
        );

        if (maxScrollLeft > 0) {
          if (element.scrollLeft >= maxScrollLeft - 1) {
            element.scrollLeft = maxScrollLeft;

            updateVideoScrollState();

            if (videoRafRef.current) {
              cancelAnimationFrame(videoRafRef.current);

              videoRafRef.current = null;
            }

            setVideoAutoScroll(false);

            return;
          }

          element.scrollLeft = Math.min(
            element.scrollLeft + speed,
            maxScrollLeft,
          );

          updateVideoScrollState();
        }
      }

      videoRafRef.current = requestAnimationFrame(step);
    };

    videoRafRef.current = requestAnimationFrame(step);

    return () => {
      if (videoRafRef.current) {
        cancelAnimationFrame(videoRafRef.current);

        videoRafRef.current = null;
      }
    };
  }, [videoAutoScroll, allVideos.length, updateVideoScrollState]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="px-8 pb-12">
        <div className="h-96 w-full animate-pulse rounded-2xl bg-[#111827]" />

        <div className="mt-16 h-6 w-1/3 animate-pulse rounded bg-[#111827]" />

        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-[#111827]" />
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

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

  // ============================================================
  // DERIVED TITLE DATA
  // ============================================================

  const title = data.title || data.name;

  const backdrop = getTmdbImage(data.backdrop_path, "original");

  const poster = getTmdbImage(data.poster_path, "w342");

  const reviews = data.reviews?.results || [];

  const toggleReview = (id) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  // ============================================================
  // YEAR DATA
  // ============================================================

  const startYear = (data.release_date || data.first_air_date || "").slice(
    0,
    4,
  );

  const endYear =
    mediaType === "tv" && data.status === "Ended"
      ? (data.last_air_date || "").slice(0, 4)
      : "";

  // ============================================================
  // RATING / RUNTIME
  // ============================================================

  const rating = data.vote_average?.toFixed(1);

  const runtime = data.runtime
    ? `${data.runtime} Mins`
    : data.episode_run_time?.[0]
      ? `${data.episode_run_time[0]} Mins Per Episode`
      : null;

  // ============================================================
  // WATCHLIST / FAVORITE ITEM
  // ============================================================

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

    genre_ids: data.genres?.map((genre) => genre.id) || [],

    original_language: data.original_language,

    origin_country: data.origin_country,
  };

  // ============================================================
  // USER STATUS
  // ============================================================

  const inWatchlist = isInWatchlist(data.id, mediaType);

  const favorited = isFavorited(data.id, mediaType);

  const myRating = getRating(data.id, mediaType);

  // ============================================================
  // OVERVIEW
  // ============================================================

  const overview = data.overview || "";

  const overviewIsLong = overview.length > 260;

  const displayedOverview =
    !showFullOverview && overviewIsLong
      ? `${overview.slice(0, 260)}...`
      : overview;

  // ============================================================
  // CAST
  // ============================================================

  const cast = getCastList(data, mediaType).slice(0, 3);

  // ============================================================
  // SHARE URLS
  // ============================================================

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${data.id}`;

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  const showToast = (message) => {
    setToastMessage(message);
  };

  // ============================================================
  // COPY LINK
  // ============================================================

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);

    showToast("Link copied to clipboard!");
  };

  // ============================================================
  // FAVORITE / RATING
  // ============================================================

  const handleFavoriteClick = () => {
    if (myRating > 0) {
      setRating(item, 0);
      addNotification({
        title: "Rating Removed",
        message: title,
        image: poster,
        link: `/${mediaType}/${data.id}`,
      });
      showToast("Rating removed");
      return;
    }

    if (!inWatchlist) {
      showToast("Add to your watchlist first to rate this title.");

      return;
    }

    setRatingMenuOpen((value) => !value);
  };

  // ============================================================
  // WATCHLIST
  // ============================================================

  const handleWatchlistClick = () => {
    const wasInWatchlist = inWatchlist;
    toggleWatchlist(item);
    addNotification({
      title: wasInWatchlist ? "Removed from Watchlist" : "Added to Watchlist",
      message: title,
      image: poster,
      link: `/${mediaType}/${data.id}`,
    });
    showToast(wasInWatchlist ? "Removed from Watchlist" : "Added to Watchlist");
  };

  // ============================================================
  // RATING
  // ============================================================

  const handleRate = (n) => {
    setRating(item, n);
    setRatingMenuOpen(false);
    addNotification({
      title: `Rated ${n}/10`,
      message: title,
      image: poster,
      link: `/${mediaType}/${data.id}`,
    });
    showToast(n > 0 ? `Rated ${n}/10` : "Rating removed");
  };

  // ============================================================
  // NATIVE SHARE
  // ============================================================

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title,
          url: shareUrl,
        })
        .catch(() => {});

      setShareMenuOpen(false);
    } else {
      setShareMenuOpen((value) => !value);
    }
  };

  // ============================================================
  // VIDEO SCROLL CONTROLS
  // ============================================================

  const scrollVideos = (direction) => {
    if (videoRafRef.current) {
      cancelAnimationFrame(videoRafRef.current);
      videoRafRef.current = null;
    }

    setVideoAutoScroll(false);

    const element = videoScrollRef.current;

    if (!element) {
      return;
    }

    const amount = Math.min(520, element.clientWidth * 0.85);

    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="px-8 pb-16">

{/* ========================================================
    HERO
======================================================== */}

<div className="relative">
  <div className="relative h-[520px] overflow-hidden rounded-2xl sm:h-96">

    {backdrop ? (
      <img
        src={backdrop}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    ) : poster ? (
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-md"
      />
    ) : (
      <PosterFallback title={title} className="absolute inset-0" />
    )}

    <div className="absolute inset-0 bg-linear-to-t from-[#080D17]/60 via-[#080D17]/40 to-black/30" />

    {/* ==================================================
        BACK BUTTON
    ================================================== */}

    <BackButton className="absolute left-3 top-3 sm:left-6 sm:top-6" />

    {/* ==================================================
        HERO ACTIONS
    ================================================== */}

    <div className="absolute right-3 top-3 sm:right-6 sm:top-6">
      <div className="flex items-start gap-3 sm:gap-6">

        {/* ==============================================
            FAVORITE + RATING
        ============================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="flex flex-col items-center gap-1 text-[10px] font-medium text-white sm:gap-1.5 sm:text-xs"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border sm:h-11 sm:w-11 ${
                myRating > 0 ? "border-red-500/60" : "border-white/30"
              }`}
            >
              {myRating > 0 ? (
                <IoHeart className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
              ) : (
                <IoHeartOutline className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </span>

            {myRating > 0 ? `Rated ${myRating}/10` : "Favorite"}
          </button>

          {/* Rating popup */}
          {ratingMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRatingMenuOpen(false)}
              />

              <div className="absolute right-0 top-12 z-20 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A]/60 px-4 py-3 shadow-xl shadow-black/40 sm:top-14">
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Your Rating
                </p>

                <RatingHearts
                  rating={myRating}
                  onRate={handleRate}
                />
              </div>
            </>
          )}
        </div>

        {/* ==============================================
            SHARE
        ============================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1 text-[10px] font-medium text-white sm:gap-1.5 sm:text-xs"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 sm:h-11 sm:w-11">
              <IoShareSocialOutline className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>

            Share
          </button>

          {shareMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShareMenuOpen(false)}
              />

              <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40 sm:top-14">
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

        {/* ==============================================
            MORE
        ============================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreMenuOpen((value) => !value)}
            className="flex flex-col items-center gap-1 text-[10px] font-medium text-white sm:gap-1.5 sm:text-xs"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 sm:h-11 sm:w-11">
              <IoEllipsisHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>

            More
          </button>

          {moreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMoreMenuOpen(false)}
              />

              <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40 sm:top-14">
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
    </div>

    {/* ==================================================
        HERO CONTENT
    ================================================== */}

    <div className="absolute inset-x-4 bottom-4 flex flex-col gap-4 sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pl-42">

      <div className="min-w-0">

        <h1 className="text-xl font-bold text-white sm:text-2xl sm:text-3xl">
          {title}
        </h1>

        {/* Genres */}

        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
          {data.genres?.slice(0, 3).map((genre) => {
            const color = getGenreColor(genre.name);

            return (
              <span
                key={genre.id}
                className="rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-md sm:px-4 sm:py-1.5 sm:text-sm"
                style={{
                  backgroundColor: hexToRgba(color, 0.3),
                  border: `1px solid ${hexToRgba(color, 0.8)}`,
                }}
              >
                {genre.name}
              </span>
            );
          })}

          {/* Year */}

          {startYear && (
            <span className="text-xs text-gray-300 sm:text-sm">
              • {startYear}

              {mediaType === "tv" && (
                <>
                  {" "}
                  - {data.status === "Ended" ? endYear : "Ongoing"}
                </>
              )}
            </span>
          )}
        </div>

        {/* Rating / Season / Runtime */}

        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3 sm:gap-3">
          {rating && (
            <span className="flex items-center gap-1.5 rounded-xl bg-black/50 py-1.5 pl-1.5 pr-3 text-xs font-bold text-white sm:gap-2 sm:rounded-2xl sm:py-2 sm:pl-2 sm:pr-4 sm:text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 sm:h-6 sm:w-6">
                <IoStar className="h-3 w-3 text-black sm:h-3.5 sm:w-3.5" />
              </span>

              {rating}

              <span className="font-medium text-gray-300">
                IMDB
              </span>
            </span>
          )}

          {mediaType === "tv" && data.number_of_seasons && (
            <span className="flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 text-xs font-bold text-white sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-sm">
              <IoFilm className="h-3.5 w-3.5 text-[#6B6DF6] sm:h-4 sm:w-4" />

              {data.number_of_seasons} Season
              {data.number_of_seasons > 1 ? "s" : ""}
            </span>
          )}

          {runtime && (
            <span className="flex items-center gap-1.5 rounded-xl bg-black/50 px-3 py-1.5 text-xs font-bold text-white sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-sm">
              <IoTime className="h-3.5 w-3.5 text-[#6B6DF6] sm:h-4 sm:w-4" />

              {runtime}
            </span>
          )}
        </div>
      </div>

      {/* ==================================================
          HERO BUTTONS
      ================================================== */}

      <div className="flex w-full gap-2 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:gap-2">

        <button
          type="button"
          onClick={handleWatchlistClick}
          className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold text-white transition sm:flex-none sm:px-5 sm:py-2.5 sm:text-sm ${
            inWatchlist
              ? "border-transparent bg-linear-to-b from-[#A855F7] to-[#3B82F6]"
              : "border-[#A855F7] bg-transparent hover:bg-[#A855F7]/10"
          }`}
        >
          {inWatchlist ? "In Watchlist" : "+ Add to Watchlist"}
        </button>

        <button
          type="button"
          onClick={() => mainTrailer && setActiveVideo(mainTrailer)}
          disabled={!mainTrailer}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          <IoPlay className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Watch Trailer
        </button>
      </div>
    </div>
  </div>

  {/* ======================================================
      POSTER
  ====================================================== */}

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

      {/* ========================================================
          INFORMATION GRID
      ======================================================== */}

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ======================================================
            OVERVIEW
        ====================================================== */}

        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <h2 className="font-bold text-white">Overview</h2>

          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {displayedOverview || "No overview available."}
          </p>

          {overviewIsLong && (
            <button
              type="button"
              onClick={() => setShowFullOverview((value) => !value)}
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

        {/* ======================================================
            TOP CAST
        ====================================================== */}

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

        {/* ======================================================
            INFORMATION
        ====================================================== */}

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
              value={
                data.genres?.map((genre) => genre.name).join(", ") || "N/A"
              }
            />
          </dl>
        </div>
      </div>

      {/* ========================================================
          EPISODE GUIDE
      ======================================================== */}

      {mediaType === "tv" && data.seasons?.length > 0 && (
        <section ref={episodeGuideRef} className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-white">Episode Guide</h2>

          {/* ==================================================
      SEASON SELECTOR
  ================================================== */}

          <div className="mb-4"> <div className="flex items-center gap-2"> {/* Previous season */} <button type="button" onClick={() => scrollSeasons("left")} disabled={!canScrollSeasonLeft} aria-label="Scroll seasons left" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#26365F] bg-[#080D17] text-gray-400 transition-all duration-200 hover:border-[#477DF7]/70 hover:text-white disabled:pointer-events-none disabled:opacity-20 sm:h-9 sm:w-9" > <IoChevronBack className="h-4 w-4" /> </button> {/* Season pills */} <div ref={seasonScrollRef} className="min-w-0 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", }} > <div className="flex w-max gap-2 py-1"> {data.seasons.map((season) => ( <button key={season.id} type="button" onClick={() => setSelectedSeason(season.season_number) } className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${ selectedSeason === season.season_number ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white shadow-[0_4px_14px_rgba(59,130,246,0.18)]" : "border border-[#477DF7]/70 text-gray-200 hover:bg-white/10" }`} > {season.name} </button> ))} </div> </div> {/* Next season */} <button type="button" onClick={() => scrollSeasons("right")} disabled={!canScrollSeasonRight} aria-label="Scroll seasons right" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#26365F] bg-[#080D17] text-gray-400 transition-all duration-200 hover:border-[#477DF7]/70 hover:text-white disabled:pointer-events-none disabled:opacity-20 sm:h-9 sm:w-9" > <IoChevronForward className="h-4 w-4" /> </button> </div> {/* Season scroll indicator */} <div className="mt-2 flex justify-center px-1"> <div className="relative h-1 w-full max-w-[260px] overflow-hidden rounded-full bg-[#17233D]"> <div className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#A855F7] to-[#3B82F6] transition-[width] duration-150 ease-out" style={{ width: `${Math.max( seasonScrollProgress > 0 ? 8 : 18, seasonScrollProgress, )}%`, }} /> </div> </div> </div>

          {/* ==================================================
                EPISODE LOADING STATE
            ================================================== */}

          {episodesLoading && (
            <div className="space-y-3">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-xl bg-[#111827]"
                />
              ))}
            </div>
          )}

          {/* ==================================================
                EMPTY EPISODE STATE
            ================================================== */}

          {!episodesLoading && episodes.length === 0 && (
            <p className="text-sm text-gray-400">
              No episode information available for this season.
            </p>
          )}

          {/* ==================================================
                EPISODE LIST
            ================================================== */}

          {!episodesLoading && episodes.length > 0 && (
            <>
              <div className="space-y-3">
                {pagedEpisodes.map((ep) => {
                  const still = ep.still_path
                    ? getTmdbImage(ep.still_path, "w300")
                    : null;

                  return (
                    <div
                      key={ep.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0B0F1A] p-3 sm:flex-row"
                    >
                      {/* Episode Image */}

                      {still ? (
                        <img
                          src={still}
                          alt={ep.name}
                          className="h-40 w-full shrink-0 rounded-lg object-cover sm:h-24 sm:w-40"
                        />
                      ) : (
                        <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs text-gray-500 sm:h-24 sm:w-40">
                          No image
                        </div>
                      )}

                      {/* Episode Information */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-white">
                            {ep.episode_number}. {ep.name}
                          </p>

                          {ep.vote_average > 0 && (
                            <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-amber-400">
                              ★ {ep.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {ep.air_date || "TBA"}

                          {ep.runtime ? ` • ${ep.runtime} min` : ""}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                          {ep.overview || "No overview available."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ==================================================
        EPISODE PAGINATION
================================================== */}
              {totalEpisodePages > 1 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B0F1A] px-4 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Episode range */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-400">
                        Episode Navigator
                      </p>

                      <p className="mt-1 text-sm text-gray-300">
                        Episodes{" "}
                        <span className="font-semibold text-white">
                          {(episodePage - 1) * EPISODES_PER_PAGE + 1}
                        </span>
                        {" – "}
                        <span className="font-semibold text-white">
                          {Math.min(
                            episodePage * EPISODES_PER_PAGE,
                            episodes.length,
                          )}
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          of {episodes.length}
                        </span>
                      </p>
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-2">
                      {/* Previous */}
                      <button
                        type="button"
                        onClick={() =>
                          setEpisodePage((p) => Math.max(1, p - 1))
                        }
                        disabled={episodePage === 1}
                        aria-label="Previous episode page"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#080D17] text-gray-400 transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <IoChevronBack className="h-4 w-4" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-[#080D17] p-1">
                        {getPageWindow(episodePage, totalEpisodePages).map(
                          (n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setEpisodePage(n)}
                              aria-current={
                                n === episodePage ? "page" : undefined
                              }
                              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                                n === episodePage
                                  ? "bg-linear-to-b from-[#A855F7] to-[#3B82F6] text-white shadow-lg shadow-purple-950/30"
                                  : "text-gray-500 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {n}
                            </button>
                          ),
                        )}
                      </div>

                      {/* Next */}
                      <button
                        type="button"
                        onClick={() =>
                          setEpisodePage((p) =>
                            Math.min(totalEpisodePages, p + 1),
                          )
                        }
                        disabled={episodePage === totalEpisodePages}
                        aria-label="Next episode page"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#080D17] text-gray-400 transition hover:border-purple-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        <IoChevronForward className="h-4 w-4" />
                      </button>

                      {/* Go to page */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();

                          const num = parseInt(pageInput, 10);

                          if (
                            !isNaN(num) &&
                            num >= 1 &&
                            num <= totalEpisodePages
                          ) {
                            setEpisodePage(num);
                          }

                          setPageInput("");
                        }}
                        className="ml-1 hidden items-center gap-1.5 sm:flex"
                      >
                        <input
                          type="number"
                          min="1"
                          max={totalEpisodePages}
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value)}
                          placeholder="#"
                          aria-label="Episode page number"
                          className="h-9 w-12 rounded-xl border border-white/10 bg-[#080D17] px-2 text-center text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                        />

                        <button
                          type="submit"
                          className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                        >
                          Go
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#17233D]">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#A855F7] to-[#3B82F6] transition-[width] duration-300"
                      style={{
                        width: `${(episodePage / totalEpisodePages) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ========================================================
    VIDEOS & CLIPS
======================================================== */}
      {allVideos.length > 1 && (
        <section className="mt-10">
          {/* ----------------------------------------------------
        SECTION HEADER
    ----------------------------------------------------- */}
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#A855F7]" />

                <h2 className="text-xl font-bold text-white">Videos & Clips</h2>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Trailers, teasers, featurettes and more
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollVideos("left")}
                disabled={!canScrollVideosLeft}
                aria-label="Previous videos"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0B0F1A] text-gray-400 transition hover:border-purple-500/40 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <img src={arrowLeft} alt="" className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollVideos("right")}
                disabled={!canScrollVideosRight}
                aria-label="Next videos"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0B0F1A] text-gray-400 transition hover:border-purple-500/40 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <img src={arrowRight} alt="" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------
        VIDEO RAIL
    ----------------------------------------------------- */}
          <div className="relative">
            <div
              ref={videoScrollRef}
              onMouseEnter={() => {
                videoPausedRef.current = true;
              }}
              onMouseLeave={() => {
                videoPausedRef.current = false;
              }}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-3 scrollbar-none"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {allVideos.slice(0, 10).map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => {
                    if (videoRafRef.current) {
                      cancelAnimationFrame(videoRafRef.current);

                      videoRafRef.current = null;
                    }

                    setVideoAutoScroll(false);
                    setActiveVideo(video);
                  }}
                  className="group relative aspect-video w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] text-left shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-950/20 sm:w-[300px]"
                >
                  {/* Thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                    alt={video.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Cinematic overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/10" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-white/60 group-hover:bg-[#A855F7]/80">
                      <IoPlay className="ml-0.5 h-5 w-5" />
                    </span>
                  </div>

                  {/* Video type */}
                  <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {video.type}
                  </span>

                  {/* Official badge */}
                  {video.official && (
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-black">
                      Official
                    </span>
                  )}

                  {/* Video information */}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                      {video.name}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      <span>YouTube</span>

                      <span className="h-1 w-1 rounded-full bg-gray-500" />

                      <span>{video.type}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* --------------------------------------------------
          VIDEO PROGRESS INDICATOR
      --------------------------------------------------- */}
            <div className="mt-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />

              <div className="relative h-1 w-28 overflow-hidden rounded-full bg-[#17233D]">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#A855F7] to-[#3B82F6] transition-[width] duration-150 ease-out"
                  style={{
                    width: `${Math.max(
                      videoScrollProgress > 0 ? 10 : 22,
                      videoScrollProgress,
                    )}%`,
                  }}
                />
              </div>

              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          USER REVIEWS
      ======================================================== */}
      {reviews.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-white">User Reviews</h2>

          <div
            className={`grid gap-4 ${
              reviews.slice(0, 5).length === 1
                ? "grid-cols-1"
                : reviews.slice(0, 5).length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            }`}
          >
            {reviews.slice(0, 5).map((review) => {
              const isLong = review.content.length > 400;

              const previewContent = isLong
                ? `${review.content.slice(0, 400)}...`
                : review.content;

              const rating = review.author_details?.rating;
              const avatarPath = review.author_details?.avatar_path;

              const avatarUrl = avatarPath
                ? avatarPath.startsWith("/http")
                  ? avatarPath.slice(1)
                  : getTmdbImage(avatarPath, "w92")
                : null;

              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5"
                >
                  <div className="flex items-start gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gray-300">
                        {review.author.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-white">
                          {review.author}
                        </p>

                        {rating && (
                          <span className="flex items-center gap-1 text-sm font-bold text-amber-400">
                            ★ {rating}/10
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-300">
                    {previewContent}
                  </p>

                  {isLong && (
                    <button
                      type="button"
                      onClick={() => setActiveReview(review)}
                      className="mt-2 text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                      Read More
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        
        </section>
      )}
      {/* ========================================================
          YOU MAY ALSO LIKE
      ======================================================== */}

      {recommended.length > 0 && (
        <MovieSection
          title="You May Also Like"
          movies={recommended}
           showChevron={false}
          viewAllPath="/explore"
          autoScroll
        />
      )}

      {/* ========================================================
          REVIEW MODAL
      ======================================================== */}
      {activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div
            className="absolute inset-0"
            onClick={() => setActiveReview(null)}
          />
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-6">
            <button
              type="button"
              onClick={() => setActiveReview(null)}
              aria-label="Close review"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <IoClose className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              {activeReview.author_details?.avatar_path ? (
                <img
                  src={
                    activeReview.author_details.avatar_path.startsWith("/http")
                      ? activeReview.author_details.avatar_path.slice(1)
                      : getTmdbImage(
                          activeReview.author_details.avatar_path,
                          "w92",
                        )
                  }
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-gray-300">
                  {activeReview.author.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-white">{activeReview.author}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activeReview.created_at).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "short", day: "numeric" },
                  )}
                </p>
              </div>
              {activeReview.author_details?.rating && (
                <span className="ml-auto flex items-center gap-1 text-sm font-bold text-amber-400">
                  ★ {activeReview.author_details.rating}/10
                </span>
              )}
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {activeReview.content}
            </p>
          </div>
        </div>
      )}
      {/* ========================================================
          VIDEO MODAL
      ======================================================== */}

      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          {/* Modal Backdrop */}

          <div
            className="absolute inset-0"
            onClick={() => setActiveVideo(null)}
          />

          {/* Modal Content */}

          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <IoClose className="h-5 w-5" />
            </button>

            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1`}
                title={activeVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TOAST
      ======================================================== */}

      <Toast
        message={toastMessage}
        show={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

export default Details;
