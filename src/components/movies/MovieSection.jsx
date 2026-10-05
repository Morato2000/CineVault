import { useRef, useState, useEffect, useCallback } from "react";

import { Link } from "react-router-dom";

import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";

import { IoChevronForward, IoAlertCircleOutline } from "react-icons/io5";

import arrowLeft from "../../assets/icons/arrow-left.svg";
import arrowRight from "../../assets/icons/arrow-right.svg";

function MovieSection({
  title,
  movies,
  type,
  icon: Icon,
  iconClass = "text-white",
  autoScroll = false,
  loading = false,
  error = null,
  emptyMessage = "No titles found.",
  viewAllPath = null,
  showChevron = true,
}) {
  // ============================================================
  // 01. REFS
  // ============================================================

  const scrollRef = useRef(null);
  const rafRef = useRef(null);

  // Keeps the pause state available to requestAnimationFrame
  // without restarting the animation whenever hover changes.
  const isPausedRef = useRef(false);

  // ============================================================
  // 02. STATE
  // ============================================================

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Position of the custom CineVault scroll indicator.
  const [scrollProgress, setScrollProgress] = useState(0);

  // Controls whether automatic scrolling is enabled.
  const [autoScrollActive, setAutoScrollActive] = useState(autoScroll);

  const hasContent = !loading && !error && movies.length > 0;

  const isEmpty = !loading && !error && movies.length === 0;

  // ============================================================
  // 03. UPDATE SCROLL STATE
  // ============================================================

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;

    if (!el) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

    // Arrow button states
    setCanScrollLeft(el.scrollLeft > 0);

    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);

    // Custom scroll indicator
    const progress =
      maxScrollLeft > 0 ? (el.scrollLeft / maxScrollLeft) * 100 : 0;

    setScrollProgress(progress);
  }, []);

  // ============================================================
  // 04. KEEP AUTO-SCROLL IN SYNC WITH PROP
  // ============================================================

  useEffect(() => {
    setAutoScrollActive(autoScroll);
  }, [autoScroll]);

  // ============================================================
  // 05. SCROLL EVENT + RESIZE
  // ============================================================

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;

    if (!el) return;

    el.addEventListener("scroll", updateScrollState);

    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);

      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, movies]);

  // ============================================================
  // 06. AUTO-SCROLL
  // ============================================================

  useEffect(() => {
    if (!autoScrollActive || !hasContent) {
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
      const el = scrollRef.current;

      if (!el) {
        rafRef.current = null;
        return;
      }

      // --------------------------------------------------------
      // PAUSE WHILE HOVERING
      // --------------------------------------------------------

      if (!isPausedRef.current) {
        const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

        if (maxScrollLeft > 0) {
          // ----------------------------------------------------
          // REACHED THE END
          // ----------------------------------------------------

          if (el.scrollLeft >= maxScrollLeft - 1) {
            el.scrollLeft = maxScrollLeft;

            if (rafRef.current) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
            }

            setAutoScrollActive(false);
          } else {
            el.scrollLeft = Math.min(el.scrollLeft + speed, maxScrollLeft);
          }

          updateScrollState();
        }
      }

      // Continue the animation loop.
      rafRef.current = requestAnimationFrame(step);
    };

    // Start auto-scroll.
    rafRef.current = requestAnimationFrame(step);

    // Cleanup.
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);

        rafRef.current = null;
      }
    };
  }, [autoScrollActive, hasContent, updateScrollState]);

  // ============================================================
  // 07. ARROW SCROLL
  // ============================================================

  const scroll = (direction) => {
    // Immediately stop auto-scroll.
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);

      rafRef.current = null;
    }

    setAutoScrollActive(false);

    const el = scrollRef.current;

    if (!el) return;

    const scrollAmount = 520;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ============================================================
  // 08. RENDER
  // ============================================================

  return (
    <section className="mt-8">
      {/* ======================================================
          SECTION HEADER
      ======================================================= */}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          {Icon && <Icon className={`h-5 w-5 ${iconClass}`} />}

          {title}

          {showChevron && (
            <IoChevronForward className="h-5 w-5 text-gray-400" />
          )}
        </h2>

        {hasContent && (
          <div className="flex items-center gap-3">
            {/* LEFT ARROW */}

            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141134] bg-[#040B15] text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#040B15]"
            >
              <img src={arrowLeft} alt="" className="h-4 w-4" />
            </button>

            {/* RIGHT ARROW */}

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141134] bg-[#040B15] text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#040B15]"
            >
              <img src={arrowRight} alt="" className="h-4 w-4" />
            </button>

            {/* VIEW ALL */}

            {viewAllPath && (
              <Link
                to={viewAllPath}
                className="ml-2 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
              >
                View All →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
    LOADING
======================================================= */}
      {loading && (
        <div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} size="md" />
          ))}
        </div>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && !loading && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-4 text-sm text-red-300">
          <IoAlertCircleOutline className="h-5 w-5 shrink-0" />
          Couldn't load titles right now. Please try again later.
        </div>
      )}

      {/* ======================================================
          EMPTY
      ======================================================= */}

      {isEmpty && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-gray-400">
          {emptyMessage}
        </div>
      )}

      {/* ======================================================
          MOVIE CARDS + CUSTOM SCROLL SLIDER
      ======================================================= */}

      {hasContent && (
        <div className="relative">
          {/* --------------------------------------------------
              MOVIE CARDS
          --------------------------------------------------- */}

          <div
            ref={scrollRef}
            onMouseEnter={() => {
              isPausedRef.current = true;
            }}
            onMouseLeave={() => {
              isPausedRef.current = false;
            }}
            onTouchStart={() => {
              // Stop auto-scroll as soon as the user starts swiping.
              if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }

              isPausedRef.current = true;
              setAutoScrollActive(false);
            }}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} type={type} />
            ))}
          </div>

          {/* --------------------------------------------------
              CINEVAULT CUSTOM SCROLL INDICATOR
          --------------------------------------------------- */}

          <div className="mt-1 flex justify-center px-1">
            <div className="relative h-1 w-full max-w-[260px] overflow-hidden rounded-full bg-[#17233D]">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-linear-to-r from-[#A855F7] to-[#3B82F6] transition-[width] duration-150 ease-out"
                style={{
                  width: `${Math.max(
                    scrollProgress > 0 ? 8 : 18,
                    scrollProgress,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MovieSection;
