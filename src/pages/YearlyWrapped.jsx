import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IoFilm,
  IoHeart,
  IoTimerOutline,
  IoSparkles,
  IoTrophy,
  IoCalendarOutline,
  IoArrowForward,
} from "react-icons/io5";
import WrappedStory from "../components/wrapped/WrappedStory";
import { useWrappedData } from "../hooks/useWrappedData";

function YearlyWrapped() {
  const navigate = useNavigate();

  const previousYear = useMemo(
    () => new Date(new Date().getFullYear() - 1, 0, 1),
    [],
  );

  // const data = useWrappedData("yearly", previousYear);

  const location = useLocation();
  const isPreview =
    new URLSearchParams(location.search).get("preview") === "true";

  const realData = useWrappedData("yearly", previousYear);

  const data = isPreview
    ? {
        ...realData,
        isEmpty: false,
        label: "2025",
        totalTitles: 42,
        movieCount: 30,
        tvCount: 12,

        topGenre: "Science Fiction",
        topGenreColor: "#A855F7",
        topGenrePercent: 38,

        topGenres: [
          { name: "Science Fiction", percent: 38, color: "#A855F7" },
          { name: "Drama", percent: 27, color: "#3B82F6" },
          { name: "Thriller", percent: 19, color: "#10B981" },
        ],
        busiestMonth: { month: "October", count: 9 },
        totalMinutesFormatted: "126h 30m",
        highestRatedOfPeriod: {
          title: "Interstellar",
          name: "Interstellar",
          rating: 10,
        },
        ratedCount: 18,
        vibe: "The Cosmic Explorer",
      }
    : realData;

  if (data.isEmpty) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#080D17] p-8 text-center text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-purple-600/25 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <IoTrophy className="h-9 w-9 text-amber-300" />
        </div>

        <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-purple-300">
          CineVault Wrapped
        </p>

        <h1 className="relative mt-3 text-3xl font-black tracking-tight">
          No story to tell. Yet.
        </h1>

        <p className="relative mt-3 max-w-xs text-sm leading-6 text-gray-400">
          There wasn't any watchlist activity in {data.label}. Every great movie
          journey starts somewhere.
        </p>

        <button
          onClick={() => navigate("/wrapped")}
          className="relative mt-7 rounded-full bg-gradient-to-r from-[#A855F7] to-[#3B82F6] px-6 py-3 text-sm font-bold transition hover:scale-105"
        >
          Back to Wrapped
        </button>
      </div>
    );
  }

  const base =
    "relative isolate flex h-full flex-col items-center justify-center gap-5 overflow-hidden p-8 text-center text-white";

  const glow =
    "pointer-events-none absolute -z-10 h-72 w-72 rounded-full blur-[90px]";

  const slides = [
    // 1. Opening
    <div key="1" className={`${base} bg-[#080D17]`}>
      <div className={`${glow} -right-32 -top-24 bg-purple-600/40`} />
      <div className={`${glow} -bottom-32 -left-28 bg-blue-600/30`} />

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_12px_#A855F7]" />
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-300">
          Your year, rewound
        </p>
      </div>

      <h1 className="text-6xl font-black leading-[0.9] tracking-tight sm:text-8xl">
        THE
        <br />
        <span className="bg-gradient-to-r from-[#C084FC] via-[#818CF8] to-[#60A5FA] bg-clip-text text-transparent">
          BIG
        </span>
        <br />
        RECAP.
      </h1>

      <p className="max-w-xs text-sm leading-6 text-gray-300 sm:text-base">
        A whole year of movies, series, and stories worth keeping.
      </p>

      <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
        <IoSparkles className="text-purple-400" />
        CineVault Wrapped
      </div>
    </div>,

    // 2. Total titles
    <div key="2" className={`${base} bg-[#211044]`}>
      <div className={`${glow} -right-28 -top-24 bg-fuchsia-500/50`} />
      <div className={`${glow} -bottom-32 -left-20 bg-blue-500/40`} />

      <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-200">
        Your year in titles
      </p>

      <IoFilm className="h-12 w-12 text-purple-200" />

      <p className="text-[7rem] font-black leading-none tracking-[-0.08em] sm:text-[9rem]">
        {data.totalTitles}
      </p>

      <h2 className="text-2xl font-black leading-tight sm:text-3xl">
        ADDED TO YOUR
        <br />
        WATCHLIST.
      </h2>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <span className="rounded-full border border-blue-300/20 bg-blue-400/15 px-4 py-2 text-sm font-semibold text-blue-100">
          {data.movieCount} movies
        </span>
        <span className="rounded-full border border-green-300/20 bg-green-400/15 px-4 py-2 text-sm font-semibold text-green-100">
          {data.tvCount} TV series
        </span>
      </div>
    </div>,

    // 3. Top genre
    data.topGenre && (
      <div
        key="3"
        className={`${base} bg-[#111827]`}
        style={{
          background: `radial-gradient(ellipse at 50% 25%, ${data.topGenreColor || "#A855F7"}66, transparent 65%), linear-gradient(160deg, #17102A, #080D17 75%)`,
        }}
      >
        <div className={`${glow} -right-32 -top-24 bg-purple-500/30`} />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">
          Your taste has a signature
        </p>

        <div className="rounded-3xl border border-white/15 bg-black/20 p-5 backdrop-blur-sm">
          <IoSparkles className="h-8 w-8 text-purple-200" />
        </div>

        <h2 className="max-w-full break-words text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
          {data.topGenre}
        </h2>

        <div className="mt-2 h-1.5 w-20 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />

        <p className="max-w-xs text-base leading-7 text-gray-300">
          Your number-one genre this year.
        </p>

        {data.vibe && (
          <p className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-200">
            Your vibe:{" "}
            <span className="font-black text-white">{data.vibe}</span>
          </p>
        )}
      </div>
    ),

    // 3b. Top 3 genres
    data.topGenres?.length > 1 && (
      <div
        key="top3"
        className={`${base} bg-[#111827]`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 15%, #7947C044, transparent 65%), linear-gradient(160deg, #17102A, #080D17 75%)",
        }}
      >
        <div className={`${glow} -right-32 -top-24 bg-purple-500/30`} />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-200">
          Your top genres
        </p>

        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
          YOUR TOP 3
        </h2>

        <p className="max-w-xs text-sm leading-6 text-gray-300">
          The genres that shaped your year in cinema.
        </p>

        <div className="mt-2 w-full max-w-xs space-y-5 text-left">
          {data.topGenres.map((genre, index) => (
            <div key={genre.name}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-bold text-white">
                  <span className="text-xs text-gray-400">0{index + 1}</span>
                  {genre.name}
                </span>

                <span className="font-semibold text-gray-300">
                  {genre.percent}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="animate-bar h-full rounded-full"
                  style={{
                    width: `${genre.percent}%`,
                    backgroundColor: genre.color,
                    animationDelay: `${index * 180}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    // 4. Busiest month
    data.busiestMonth && (
      <div key="4" className={`${base} bg-[#10251F]`}>
        <div className={`${glow} -right-28 -top-24 bg-emerald-500/30`} />
        <div className={`${glow} -bottom-28 -left-24 bg-teal-500/25`} />

        <div className="rounded-3xl border border-emerald-200/15 bg-emerald-300/10 p-5">
          <IoCalendarOutline className="h-10 w-10 text-emerald-200" />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-100/70">
          Your peak month
        </p>

        <h2 className="break-words text-5xl font-black leading-none sm:text-7xl">
          {data.busiestMonth.month}
        </h2>

        <p className="text-lg text-gray-200">
          <span className="font-black text-emerald-200">
            {data.busiestMonth.count}
          </span>{" "}
          titles added
        </p>

        <p className="max-w-xs text-sm leading-6 text-gray-400">
          This was your busiest month for building your watchlist.
        </p>
      </div>
    ),

    // 5. Watch time
    <div key="5" className={`${base} bg-[#071B2A]`}>
      <div className={`${glow} -bottom-24 -right-24 bg-cyan-500/30`} />
      <div className={`${glow} -left-28 -top-24 bg-blue-600/30`} />

      <div className="rounded-3xl border border-cyan-200/15 bg-cyan-300/10 p-5">
        <IoTimerOutline className="h-10 w-10 text-cyan-200" />
      </div>

      <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-100/70">
        Time well spent
      </p>

      <h2 className="max-w-full break-words text-5xl font-black leading-none tracking-tight sm:text-7xl">
        {data.totalMinutesFormatted ?? "..."}
      </h2>

      <p className="max-w-xs text-base leading-7 text-gray-300">
        Estimated watch time from the titles you added.
      </p>
    </div>,

    // 6. Highest-rated title
    data.highestRatedOfPeriod && (
      <div key="6" className={`${base} bg-[#260E1C]`}>
        <div className={`${glow} -right-24 -top-24 bg-pink-500/30`} />
        <div className={`${glow} -bottom-28 -left-24 bg-purple-600/30`} />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-200">
          The one that stood out
        </p>

        <div className="rounded-3xl border border-amber-200/15 bg-amber-300/10 p-5">
          <IoTrophy className="h-10 w-10 text-amber-300" />
        </div>

        <h2 className="max-w-lg break-words text-3xl font-black leading-tight sm:text-5xl">
          {data.highestRatedOfPeriod.title || data.highestRatedOfPeriod.name}
        </h2>

        <div className="flex items-center gap-2 rounded-full border border-pink-200/15 bg-black/20 px-5 py-3">
          <IoHeart className="h-4 w-4 text-pink-300" />
          <p className="text-lg font-black">
            {data.highestRatedOfPeriod.rating}/10
          </p>
          <span className="text-sm text-gray-300">hearts</span>
        </div>

        <p className="max-w-xs text-sm leading-6 text-gray-300">
          Your highest-rated pick from the year.
        </p>
      </div>
    ),

    // 7. Personal ratings
    <div key="7" className={`${base} bg-[#28111E]`}>
      <div className={`${glow} -right-24 -top-24 bg-rose-500/30`} />
      <div className={`${glow} -bottom-28 -left-24 bg-purple-600/30`} />

      <div className="rounded-3xl border border-rose-200/15 bg-rose-300/10 p-5">
        <IoHeart className="h-10 w-10 text-rose-300" />
      </div>

      <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-200">
        You made the call
      </p>

      <p className="text-[7rem] font-black leading-none tracking-[-0.08em] sm:text-[9rem]">
        {data.ratedCount}
      </p>

      <h2 className="text-2xl font-black sm:text-3xl">TITLES YOU RATED.</h2>

      <p className="max-w-xs text-sm leading-6 text-gray-300">
        Your taste. Your verdict. Your personal hall of fame.
      </p>
    </div>,

    // 8. Closing
    <div key="8" className={`${base} bg-[#080D17]`}>
      <div className={`${glow} -right-28 -top-24 bg-blue-600/40`} />
      <div className={`${glow} -bottom-28 -left-28 bg-purple-600/40`} />

      <IoSparkles className="h-12 w-12 text-purple-300" />

      <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
        End credits
      </p>

      <h2 className="max-w-lg text-4xl font-black leading-tight sm:text-6xl">
        THAT WAS
        <br />
        <span className="bg-gradient-to-r from-[#C084FC] to-[#60A5FA] bg-clip-text text-transparent">
          {data.label}.
        </span>
      </h2>

      <p className="max-w-xs text-sm leading-6 text-gray-300 sm:text-base">
        Another year of stories, worlds, and characters worth remembering.
      </p>

      <button
        onClick={() => navigate("/wrapped")}
        className="mt-5 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#A855F7] to-[#3B82F6] px-7 py-3.5 text-sm font-black shadow-lg shadow-purple-950/40 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-[#080D17]"
      >
        Back to Wrapped
        <IoArrowForward className="h-4 w-4" />
      </button>
    </div>,
  ].filter(Boolean);

  return <WrappedStory slides={slides} />;
}

export default YearlyWrapped;
