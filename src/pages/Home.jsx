import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePreferences } from "../context/PreferencesContext";
import MovieSection from "../components/movies/MovieSection";

import {
  IoCompassSharp,
  IoFilm,
  IoStar,
  IoCalendarOutline,
  IoChevronForward,
  IoHeart,
} from "react-icons/io5";

import heroBg from "../assets/images/hero-bg.jpg";
import heroBg2 from "../assets/images/hero-bg2.png";

import FeatureHighlights from "../components/home/FeatureHighlights";

import Footer from "../components/layout/Footer";
import arrowLeft from "../assets/icons/arrow-left.svg";
import arrowRight from "../assets/icons/arrow-right.svg";
import {
  WatchlistWaitingCard,
  SaveWhatYouLoveCard,
} from "../components/home/PromoCards";

import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext";
import { useFavorites } from "../context/FavoritesContext";
import { useProfile } from "../context/ProfileContext";
import { useNotifications } from "../context/NotificationsContext";

import {
  getTrendingMovies,
  getPopularMovies,
  getPopularSeries,
  getUpcomingMovies,
  getTitleDetails,
  getSeasonDetails,
  getNewReleases,
  addTvDetails,
} from "../services/tmdb";

import PosterFallback from "../components/common/PosterFallback";

// ============================================================
// HOME STAT CARD
// ============================================================

function HomeStatCard({ icon, value, label, sub, subColor = "text-gray-500" }) {
  return (
    <div className="rounded-2xl bg-[#0B0F1A] p-6 text-center">
      <div className="flex justify-center text-4xl">{icon}</div>

      <p className="mt-4 text-3xl font-bold text-white">{value}</p>

      <p className="mt-1 font-bold text-white">{label}</p>

      {sub && <p className={`mt-2 text-xs ${subColor}`}>{sub}</p>}
    </div>
  );
}

// ============================================================
// COMING UP CARD
// ============================================================

function ComingUpCard({ item }) {
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : null;

  const date = new Date(item.date);

  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

  const day = date.getDate();

  const diffDays = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));

  const releaseText =
    diffDays <= 0
      ? "Releases today"
      : diffDays === 1
        ? "Releases tomorrow"
        : `Releases in ${diffDays} days`;

  return (
    <Link
      to={`/${item.media_type}/${item.id}`}
      className="group relative block h-[300px] w-[220px] shrink-0 overflow-hidden rounded-2xl bg-[#111827]"
    >
      {poster ? (
        <img
          src={poster}
          alt={item.title || item.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <PosterFallback
          title={item.title || item.name}
          className="absolute inset-0"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="absolute left-3 top-3 rounded-lg bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-2.5 py-1.5 text-center">
        <p className="text-[10px] font-bold uppercase text-white">{month}</p>

        <p className="text-sm font-bold text-white">{day}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="truncate font-bold text-white">
          {item.title || item.name}
        </p>

        {item.subtitle && (
          <p className="text-sm text-gray-300">{item.subtitle}</p>
        )}

        <p className="text-sm text-gray-400">{releaseText}</p>
      </div>
    </Link>
  );
}

function Home() {
  // ============================================================
  // AUTH & USER DATA
  // ============================================================

  const { isLoggedIn } = useAuth();
  const { items: watchlistItems } = useWatchlist();
  const { items: favoriteItems } = useFavorites();
  const { profile } = useProfile();
  const { addNotification } = useNotifications();
  const { preferences } = usePreferences();

  // ============================================================
  // PUBLIC HOME DATA
  // ============================================================

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // ============================================================
  // PERSONALIZED HOME DATA
  // ============================================================

  const [recommended, setRecommended] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);
  const comingUpScrollRef = useRef(null);
  const comingUpRafRef = useRef(null);
  const comingUpPausedRef = useRef(false);
  const [canScrollComingUpLeft, setCanScrollComingUpLeft] = useState(false);
  const [canScrollComingUpRight, setCanScrollComingUpRight] = useState(false);
  const [comingUpAutoScroll, setComingUpAutoScroll] = useState(true);
  const [comingUpScrollProgress, setComingUpScrollProgress] = useState(0);

  // ============================================================
  // WATCHLIST STATISTICS
  // ============================================================

  const titlesCount = watchlistItems.length;

  const avgRating = titlesCount
    ? (
        watchlistItems.reduce(
          (total, item) => total + (item.vote_average || 0),
          0,
        ) / titlesCount
      ).toFixed(1)
    : "N/A";

  const addedThisMonth = watchlistItems.filter((item) => {
    const date = new Date(item.addedAt || 0);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const addedThisWeek = watchlistItems.filter(
    (item) => Date.now() - (item.addedAt || 0) <= 7 * 24 * 60 * 60 * 1000,
  ).length;

  // ============================================================
  // RECENTLY ADDED
  // ============================================================

  const recentlyAdded = [...watchlistItems]
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
    .slice(0, 12);

  // ============================================================
  // SOURCE FOR RECOMMENDATIONS
  // ============================================================

  const [likedSource] = useState(() =>
    watchlistItems.length > 0
      ? watchlistItems[Math.floor(Math.random() * watchlistItems.length)]
      : null,
  );

  // ============================================================
  // FETCH PUBLIC HOME DATA
  // ============================================================

  useEffect(() => {
    async function fetchMovies() {
      try {
        const [trending, popular, popularTv, upcoming] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getPopularSeries(),
          getUpcomingMovies(),
        ]);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setPopularSeries(popularTv);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  // ============================================================
  // FETCH PERSONALIZED RECOMMENDATIONS
  // ============================================================

  useEffect(() => {
    if (!isLoggedIn || !likedSource) {
      setRecommended([]);
      return;
    }

    let cancelled = false;

    getTitleDetails(likedSource.media_type, likedSource.id)
      .then(async (data) => {
        const raw = (data.recommendations?.results || [])
          .slice(0, 12)
          .map((item) => ({
            ...item,
            media_type: likedSource.media_type,
          }));

        const enriched =
          likedSource.media_type === "tv" ? await addTvDetails(raw) : raw;

        if (!cancelled) {
          setRecommended(enriched);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommended([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, likedSource?.id, likedSource?.media_type]);

  // ============================================================
  // WATCHLIST NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    if (!isLoggedIn || watchlistItems.length === 0) {
      return;
    }

    let cancelled = false;

    async function checkWatchlistNotifications() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // --------------------------------------------------------
      // WATCHLIST RELEASE NOTIFICATIONS
      // --------------------------------------------------------

      for (const item of watchlistItems) {
        if (cancelled) return;

        const releaseDate = item.release_date || item.first_air_date;

        if (!releaseDate) continue;

        const date = new Date(releaseDate);

        if (Number.isNaN(date.getTime())) continue;

        date.setHours(0, 0, 0, 0);

        const title = item.title || item.name;

        if (!title) continue;

        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        // -------------------------------------------------------- //
        // WATCHLIST RELEASE NOTIFICATIONS //
        // --------------------------------------------------------
        if (preferences.notifications.upcomingMovies) {
          // Coming Soon
          if (date > today) {
            addNotification({
              title: `${title} is coming soon`,
              message: `Release date: ${formattedDate}`,
              image: item.poster_path
                ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                : null,
              link: `/${item.media_type}/${item.id}`,
              dedupeKey: `coming-soon-${item.media_type}-${item.id}`,
            });
          }

          // Now Available
          if (date <= today) {
            addNotification({
              title: `${title} is now available`,
              message: `Released on: ${formattedDate}`,
              image: item.poster_path
                ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                : null,
              link: `/${item.media_type}/${item.id}`,
              dedupeKey: `now-available-${item.media_type}-${item.id}`,
            });
          }
        }
        // ------------------------------------------------------
        // NEW EPISODES
        // ------------------------------------------------------

        if (item.media_type !== "tv") {
          continue;
        }

        if (!preferences.notifications.upcomingMovies) {
          continue;
        }

        try {
          const details = await getTitleDetails("tv", item.id);
          if (!details?.seasons?.length) {
            continue;
          }

          const seasons = details.seasons.filter(
            (season) => season.season_number > 0,
          );

          for (const season of seasons) {
            if (cancelled) return;

            try {
              const seasonDetails = await getSeasonDetails(
                item.id,
                season.season_number,
              );

              if (!seasonDetails?.episodes?.length) {
                continue;
              }

              const airedEpisodes = seasonDetails.episodes.filter((episode) => {
                if (!episode.air_date) {
                  return false;
                }

                const airDate = new Date(episode.air_date);

                if (Number.isNaN(airDate.getTime())) {
                  return false;
                }

                airDate.setHours(0, 0, 0, 0);

                return airDate <= today;
              });

              // Every episode gets its own dedupe key.
              // This prevents multiple aired episodes from being
              // collapsed into one notification.
              airedEpisodes.forEach((episode) => {
                if (!episode.episode_number) {
                  return;
                }

                addNotification({
                  title: `${title} — New episode available`,
                  message: `Season ${season.season_number}, Episode ${episode.episode_number}: ${episode.name}`,
                  image: item.poster_path
                    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                    : null,
                  link: `/tv/${item.id}`,
                  dedupeKey: `new-episode-${item.id}-s${season.season_number}e${episode.episode_number}`,
                });
              });
            } catch (error) {
              console.error(
                `Failed to check season ${season.season_number} for ${title}:`,
                error,
              );
            }
          }
        } catch (error) {
          console.error(`Failed to check episodes for ${title}:`, error);
        }
      }

      if (cancelled) return;

      // --------------------------------------------------------
      // RECOMMENDATIONS
      // --------------------------------------------------------

      const watchlistIds = new Set(
        watchlistItems.map((item) => `${item.media_type}-${item.id}`),
      );

      const source =
        watchlistItems[Math.floor(Math.random() * watchlistItems.length)];

      if (preferences.notifications.personalizedDiscoveries && source) {
        try {
          const sourceDetails = await getTitleDetails(
            source.media_type,
            source.id,
          );

          const recommendations = (
            sourceDetails?.recommendations?.results || []
          )
            .filter(
              (recommendation) =>
                !watchlistIds.has(
                  `${recommendation.media_type || source.media_type}-${recommendation.id}`,
                ),
            )
            .slice(0, 2);

          recommendations.forEach((recommendation) => {
            const recommendedTitle =
              recommendation.title || recommendation.name;

            if (!recommendedTitle) {
              return;
            }

            const recommendationMediaType =
              recommendation.media_type || source.media_type;

            addNotification({
              title: `You might like ${recommendedTitle}`,
              message: `Because ${source.title || source.name} is in your Watchlist`,
              image: recommendation.poster_path
                ? `https://image.tmdb.org/t/p/w342${recommendation.poster_path}`
                : null,
              link: `/${recommendationMediaType}/${recommendation.id}`,
              dedupeKey: `recommendation-${recommendation.id}`,
            });
          });
        } catch (error) {
          console.error("Failed to check recommendations:", error);
        }
      }

      if (cancelled) return;


      // --------------------------------------------------------
      // NEW RELEASES
      // --------------------------------------------------------

      if (preferences.notifications.newReleases) {
        try {
          const releases = await getNewReleases();

          if (!Array.isArray(releases) || !releases.length) {
            return;
          }

          const freshReleases = releases
            .filter((release) => {
              const releaseMediaType = release.media_type || "movie";

              return !watchlistIds.has(
                `${releaseMediaType}-${release.id}`,
              );
            })
            .slice(0, 2);

          freshReleases.forEach((release) => {
            const title = release.title || release.name;

            if (!title) {
              return;
            }

            const mediaType = release.media_type || "movie";

            addNotification({
              title: `New release: ${title}`,
              message: "Now available to discover on CineVault",
              image: release.poster_path
                ? `https://image.tmdb.org/t/p/w342${release.poster_path}`
                : null,
              link: `/${mediaType}/${release.id}`,
              dedupeKey: `new-release-${release.id}`,
            });
          });
        } catch (error) {
          console.error("Failed to check new releases:", error);
        }
      }
    }

    checkWatchlistNotifications();

    return () => {
      cancelled = true;
    };
  }, [
    isLoggedIn,
    watchlistItems,
    addNotification,
    preferences,
  ]);


  // ============================================================
  // COMING UP SCROLL HANDLING
  // ============================================================

  const updateComingUpScrollState = useCallback(() => {
    const el = comingUpScrollRef.current;

    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

    // Arrow states
    setCanScrollComingUpLeft(el.scrollLeft > 1);

    setCanScrollComingUpRight(el.scrollLeft < maxScrollLeft - 1);

    // Custom CineVault scroll indicator
    const progress =
      maxScrollLeft > 0 ? (el.scrollLeft / maxScrollLeft) * 100 : 0;

    setComingUpScrollProgress(progress);
  }, []);

  // ------------------------------------------------------------
  // SCROLL + RESIZE LISTENERS
  // ------------------------------------------------------------

  useEffect(() => {
    updateComingUpScrollState();

    const el = comingUpScrollRef.current;

    if (!el) return;

    el.addEventListener("scroll", updateComingUpScrollState);

    window.addEventListener("resize", updateComingUpScrollState);

    return () => {
      el.removeEventListener("scroll", updateComingUpScrollState);

      window.removeEventListener("resize", updateComingUpScrollState);
    };
  }, [updateComingUpScrollState, upcomingItems]);

  // ------------------------------------------------------------
  // AUTO-SCROLL
  // ------------------------------------------------------------

  useEffect(() => {
    if (!comingUpAutoScroll || !upcomingItems.length) {
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
      const el = comingUpScrollRef.current;

      if (!el) {
        comingUpRafRef.current = null;
        return;
      }

      // --------------------------------------------------------
      // PAUSE WHILE HOVERING
      // --------------------------------------------------------

      if (!comingUpPausedRef.current) {
        const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

        if (maxScrollLeft > 0) {
          // ----------------------------------------------------
          // STOP AT THE END
          // ----------------------------------------------------

          if (el.scrollLeft >= maxScrollLeft - 1) {
            el.scrollLeft = maxScrollLeft;

            updateComingUpScrollState();

            if (comingUpRafRef.current) {
              cancelAnimationFrame(comingUpRafRef.current);

              comingUpRafRef.current = null;
            }

            setComingUpAutoScroll(false);

            return;
          }

          // ----------------------------------------------------
          // CONTINUE AUTO-SCROLLING
          // ----------------------------------------------------

          el.scrollLeft = Math.min(el.scrollLeft + speed, maxScrollLeft);

          updateComingUpScrollState();
        }
      }

      comingUpRafRef.current = requestAnimationFrame(step);
    };

    comingUpRafRef.current = requestAnimationFrame(step);

    return () => {
      if (comingUpRafRef.current) {
        cancelAnimationFrame(comingUpRafRef.current);

        comingUpRafRef.current = null;
      }
    };
  }, [comingUpAutoScroll, upcomingItems, updateComingUpScrollState]);

  // ------------------------------------------------------------
  // ARROW SCROLL
  // ------------------------------------------------------------

  const scrollComingUp = (direction) => {
    // Stop automatic scrolling when the user
    // manually controls the carousel.
    if (comingUpRafRef.current) {
      cancelAnimationFrame(comingUpRafRef.current);

      comingUpRafRef.current = null;
    }

    setComingUpAutoScroll(false);

    const el = comingUpScrollRef.current;

    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

    const amount = 520;

    const target =
      direction === "left"
        ? Math.max(0, el.scrollLeft - amount)
        : Math.min(maxScrollLeft, el.scrollLeft + amount);

    el.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  // ============================================================
  // FETCH REAL UPCOMING RELEASES
  // ============================================================

  useEffect(() => {
    if (!isLoggedIn || watchlistItems.length === 0) {
      setUpcomingItems([]);
      return;
    }

    let cancelled = false;

    Promise.all(
      watchlistItems.map(async (item) => {
        // ------------------------------------------------------
        // MOVIES
        // ------------------------------------------------------

        if (item.media_type === "movie") {
          if (item.release_date && new Date(item.release_date) > new Date()) {
            return {
              ...item,
              date: item.release_date,
              subtitle: null,
            };
          }

          return null;
        }

        // ------------------------------------------------------
        // TV SHOWS
        // ------------------------------------------------------

        try {
          const details = await getTitleDetails("tv", item.id);

          if (details.next_episode_to_air) {
            return {
              ...item,
              date: details.next_episode_to_air.air_date,
              subtitle: `Episode ${details.next_episode_to_air.episode_number}`,
            };
          }
        } catch {
          // Ignore this title.
          // It simply won't appear in Coming Up Next.
        }

        return null;
      }),
    ).then((results) => {
      if (!cancelled) {
        setUpcomingItems(
          results
            .filter(Boolean)
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, watchlistItems]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ========================================================
          LOGGED-OUT HOME
          ======================================================== */}

      {!isLoggedIn && (
        <>
          <div className="px-8 pb-12">
            {/* ==================================================
                HERO
                ================================================== */}

            <section className="group relative aspect-[2.3/1] min-h-[360px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0B0F1A] shadow-2xl">
              {/* Background */}
              <div
                className={`absolute inset-0 bg-cover bg-right bg-no-repeat transition-all duration-700 ${
                  heroLoaded
                    ? "scale-100 opacity-100"
                    : "scale-[1.03] opacity-0"
                }`}
                style={{
                  backgroundImage: `url(${heroBg})`,
                }}
              />

              {/* Cinematic overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#080D17] via-[#080D17]/80 to-[#080D17]/15" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#080D17]/80 via-transparent to-transparent" />

              {/* Purple cinematic glow */}
              <div className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[100px]" />

              {/* Image loader */}
              {!heroLoaded && (
                <div className="absolute inset-0 animate-pulse bg-[#161D2D]" />
              )}

              {/* Hidden preload image */}
              <img
                src={heroBg}
                alt=""
                onLoad={() => setHeroLoaded(true)}
                className="hidden"
              />

              {/* Content */}
              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-8 py-12 sm:px-10 lg:px-14">
                {/* Eyebrow */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-gradient-to-r from-[#A855F7] to-[#3B82F6]" />

                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                    Your personal movie universe
                  </span>
                </div>

                {/* Heading */}
                <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Your next favorite
                  <span className="block bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#60A5FA] bg-clip-text text-transparent">
                    starts here.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-lg text-sm leading-6 text-gray-300 sm:text-base">
                  Discover movies and series, build your personal watchlist, and
                  keep everything you want to watch in one place.
                </p>

                {/* CTA */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to="/explore"
                    className="group/btn flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A855F7] to-[#3B82F6] px-6 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-purple-500/20"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95">
                      <IoCompassSharp className="h-3.5 w-3.5 text-purple-600 transition-transform group-hover/btn:rotate-12" />
                    </span>
                    Explore Titles
                    <IoChevronForward className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-semibold text-white backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    Create free account
                  </Link>
                </div>

                {/* Small feature row */}
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <IoFilm className="h-4 w-4 text-purple-400" />
                    Movies & Series
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-600" />

                  <span className="flex items-center gap-1.5">
                    <IoHeart className="h-4 w-4 text-pink-400" />
                    Personal Watchlist
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-600" />

                  <span className="flex items-center gap-1.5">
                    <IoStar className="h-4 w-4 text-amber-400" />
                    Your Favorites
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                TRENDING
                ================================================== */}

            <div className="relative">
              <MovieSection
                title="Trending This Week"
                movies={trendingMovies}
                autoScroll
                loading={loading}
              />

              <WatchlistWaitingCard className="absolute -bottom-10 right-0 z-20 hidden lg:block" />
            </div>

            {/* ==================================================
                POPULAR MOVIES
                ================================================== */}

            <div className="relative">
              <MovieSection
                title="Popular Movies"
                movies={popularMovies}
                type="Movie"
                loading={loading}
              />

              <SaveWhatYouLoveCard className="absolute -bottom-10 right-0 z-20 hidden lg:block" />
            </div>

            {/* ==================================================
                POPULAR SERIES
                ================================================== */}

            <MovieSection
              title="Popular Series"
              movies={popularSeries}
              type="TV Series"
              loading={loading}
            />

            {/* ==================================================
                COMING SOON
                ================================================== */}

            <MovieSection
              title="Coming Soon"
              movies={upcomingMovies}
              loading={loading}
            />
          </div>

          {/* ====================================================
              FEATURE HIGHLIGHTS
              ==================================================== */}

          <FeatureHighlights />

          {/* ====================================================
              FOOTER
              ==================================================== */}

          <Footer />
        </>
      )}

      {/* ========================================================
          LOGGED-IN HOME
          ======================================================== */}

      {isLoggedIn && (
        <div className="px-8 pb-12">
          {/* ==================================================
              WELCOME HEADER
              ================================================== */}

          <section className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0B0F1A] shadow-2xl">
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-right bg-no-repeat transition-transform duration-700 group-hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${heroBg2})`,
              }}
            />

            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#080D17] via-[#080D17]/85 to-[#080D17]/20" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#080D17]/80 via-transparent to-transparent" />

            {/* Ambient glow */}
            <div className="absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[110px]" />

            {/* Content */}
            <div className="relative z-10 min-h-[300px] px-8 py-10 sm:px-10 lg:px-14">
              <div className="flex h-full max-w-2xl flex-col justify-center">
                {/* Status */}
                <div className="mb-5 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                  </span>

                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                    Your CineVault
                  </span>
                </div>

                {/* Welcome */}
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-[#C084FC] to-[#60A5FA] bg-clip-text text-transparent">
                    {profile?.displayName || "there"}
                  </span>
                  <span className="ml-2">👋</span>
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-6 text-gray-300 sm:text-base">
                  Your watchlist is waiting. Pick up where you left off,
                  discover something new, or add another title to your
                  collection.
                </p>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/watchlist"
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A855F7] to-[#3B82F6] px-6 py-3 font-semibold text-white shadow-lg shadow-purple-900/20 transition-all hover:-translate-y-0.5"
                  >
                    <IoHeart className="h-4 w-4" />
                    My Watchlist
                    <IoChevronForward className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/explore"
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 font-semibold text-white backdrop-blur-md transition-all hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    <IoCompassSharp className="h-4 w-4" />
                    Discover
                  </Link>
                </div>

                {/* Quick context */}
                <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
                  <span>
                    <strong className="text-white">{titlesCount}</strong>{" "}
                    {titlesCount === 1 ? "title" : "titles"} saved
                  </span>

                  <span className="h-1 w-1 rounded-full bg-gray-600" />

                  <span>
                    <strong className="text-white">
                      {favoriteItems.length}
                    </strong>{" "}
                    favorites
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              WATCHLIST STATISTICS
              ================================================== */}

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <HomeStatCard
              icon={<IoFilm className="text-purple-500" />}
              value={titlesCount}
              label="Titles in Watchlist"
              sub={addedThisWeek > 0 ? `↑ ${addedThisWeek} this week` : null}
              subColor="text-green-400"
            />

            <HomeStatCard
              icon={<IoStar className="text-amber-400" />}
              value={avgRating}
              label="Average Rating"
              sub="Based on your list"
            />

            <HomeStatCard
              icon={<IoCalendarOutline className="text-green-500" />}
              value={addedThisMonth}
              label="Added This Month"
              sub="Keep going!"
            />

            <HomeStatCard
              icon={<IoHeart className="text-red-500" />}
              value={favoriteItems.length}
              label="Favorites"
              sub="From your list"
            />
          </div>

          {/* ==================================================
              RECENTLY ADDED
              ================================================== */}

          {recentlyAdded.length > 0 && (
            <MovieSection
              title="Recently Added"
              movies={recentlyAdded}
              autoScroll
              showChevron={false}
              viewAllPath="/watchlist"
            />
          )}

          {/* ==================================================
              COMING UP NEXT
              ================================================== */}

          {upcomingItems.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  Coming Up Next
                 
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => scrollComingUp("left")}
                    disabled={!canScrollComingUpLeft}
                    aria-label="Scroll left"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141134] bg-[#040B15] text-gray-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <img src={arrowLeft} alt="" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollComingUp("right")}
                    disabled={!canScrollComingUpRight}
                    aria-label="Scroll right"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141134] bg-[#040B15] text-gray-400 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <img src={arrowRight} alt="" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative">
                {/* ======================================================
      COMING UP NEXT CARDS
      ======================================================= */}

                <div
                  ref={comingUpScrollRef}
                  onMouseEnter={() => {
                    comingUpPausedRef.current = true;
                  }}
                  onMouseLeave={() => {
                    comingUpPausedRef.current = false;
                  }}
                  onTouchStart={() => {
                    if (comingUpRafRef.current) {
                      cancelAnimationFrame(comingUpRafRef.current);
                      comingUpRafRef.current = null;
                    }

                    comingUpPausedRef.current = true;
                    setComingUpAutoScroll(false);
                  }}
                  className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {upcomingItems.map((item) => (
                    <ComingUpCard
                      key={`${item.media_type}-${item.id}`}
                      item={item}
                    />
                  ))}
                </div>

                {/* ======================================================
      CINEVAULT SCROLL INDICATOR
      ======================================================= */}

                <div className="mt-1 flex justify-center px-1">
                  <div className="relative h-1 w-full max-w-[260px] overflow-hidden rounded-full bg-[#17233D]">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#A855F7] to-[#3B82F6] transition-[width] duration-150 ease-out"
                      style={{
                        width: `${Math.max(
                          comingUpScrollProgress > 0 ? 8 : 18,
                          comingUpScrollProgress,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================================================
                COMING SOON
                ================================================== */}

          <MovieSection
            title="Coming Soon"
            movies={upcomingMovies}
            loading={loading}
            showChevron={false}
          />

          {/* ==================================================
              RECOMMENDATIONS
              ================================================== */}

          {recommended.length > 0 && (
            <MovieSection
              title={`Because You Liked ${
                likedSource?.title || likedSource?.name
              }`}
              movies={recommended}
              viewAllPath="/explore"
              showChevron={false}
            />
          )}

          {/* ==================================================
              EMPTY WATCHLIST
              ================================================== */}

          {titlesCount === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <p className="text-gray-400">
                Your watchlist is empty — start adding titles to see them here.
              </p>

              <Link
                to="/explore"
                className="mt-4 rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-6 py-2.5 text-sm font-semibold text-white"
              >
                Explore Titles
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Home;
