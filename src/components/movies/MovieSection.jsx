import { useRef, useState, useEffect, useCallback } from "react";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";
import { IoChevronForward } from "react-icons/io5";

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
}) {
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScrollActive, setAutoScrollActive] = useState(autoScroll);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }

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

  useEffect(() => {
    if (!autoScrollActive || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.6;

    const step = () => {
      if (!scrollRef.current) return;

      const atEnd =
        scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
        scrollRef.current.scrollWidth - 1;

      if (atEnd) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollLeft += speed;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [autoScrollActive, isPaused]);

  const scroll = (direction) => {
    setAutoScrollActive(false);

    if (!scrollRef.current) return;

    const scrollAmount = 520;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          {Icon && <Icon className={`h-5 w-5 ${iconClass}`} />}
          {title}
          <IoChevronForward className="h-4 w-4 text-gray-400" />
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft || loading}
            aria-label={`Scroll ${title} left`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141134] bg-[#040B15] text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#040B15]"
          >
            <img src={arrowLeft} alt="" className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight || loading}
            aria-label={`Scroll ${title} right`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#141134] bg-[#040B15] text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-[#040B15]"
          >
            <img src={arrowRight} alt="" className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="ml-2 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            View All →
          </button>
        </div>
      </div>

      {/* Movie Cards */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))
          : movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} type={type} />
            ))}
      </div>
    </section>
  );
}

export default MovieSection;