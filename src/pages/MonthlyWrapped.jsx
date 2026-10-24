
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IoFilm,
  IoHeart,
  IoTimerOutline,
  IoSparkles,
  IoArrowForward,
} from "react-icons/io5";
import WrappedStory from "../components/wrapped/WrappedStory";
import { useWrappedData } from "../hooks/useWrappedData";

function MonthlyWrapped() {
 
const navigate = useNavigate();
const location = useLocation();

const isPreview =
  new URLSearchParams(location.search).get("preview") === "true";

const previousMonth = useMemo(() => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return date;
}, []);

const realData = useWrappedData("monthly", previousMonth);

const data = isPreview
  ? {
      ...realData,
      isEmpty: false,
      label: "September 2026",
      totalTitles: 24,
      movieCount: 17,
      tvCount: 7,
      topGenre: "Science Fiction",
      topGenreColor: "#A855F7",
      vibe: "The Cosmic Explorer",
      totalMinutesFormatted: "72h 45m",
      highestRatedOfPeriod: {
        title: "Interstellar",
        name: "Interstellar",
        rating: 10,
      },
    }
  : realData;

  if (data.isEmpty) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#080D17] p-8 text-center text-white">
        <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-purple-600/20 blur-[100px]" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <IoFilm className="h-9 w-9 text-purple-300" />
        </div>

        <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-purple-300">
          CineVault Wrapped
        </p>

        <h1 className="relative mt-3 text-3xl font-black tracking-tight">
          No story this time.
        </h1>

        <p className="relative mt-3 max-w-xs text-sm leading-6 text-gray-400">
          There wasn't any watchlist activity in {data.label}. Your next recap
          starts with the titles you save.
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
    <div
      key="1"
      className={`${base} bg-[#080D17]`}
    >
      <div className={`${glow} -right-32 -top-20 bg-purple-600/40`} />
      <div className={`${glow} -bottom-32 -left-32 bg-blue-600/30`} />

      <div className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_12px_#A855F7]" />
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-300">
          Your monthly rewind
        </p>
      </div>

      <h1 className="max-w-lg text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
        YOUR
        <br />
        <span className="bg-gradient-to-r from-[#C084FC] via-[#818CF8] to-[#60A5FA] bg-clip-text text-transparent">
          SCREEN
        </span>
        <br />
        YOUR STORY.
      </h1>

      <p className="mt-3 max-w-xs text-sm leading-6 text-gray-300 sm:text-base">
        The movies and shows that made up {data.label}.
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
        <IoSparkles className="text-purple-400" />
        CineVault Wrapped
      </div>
    </div>,

    // 2. Titles added
    <div
      key="2"
      className={`${base} bg-[#211044]`}
    >
      <div className={`${glow} -right-28 -top-24 bg-fuchsia-500/50`} />
      <div className={`${glow} -bottom-32 -left-20 bg-blue-500/40`} />

      <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-200">
        Your month in titles
      </p>

      <IoFilm className="h-12 w-12 text-purple-200" />

      <p className="text-[7rem] font-black leading-none tracking-[-0.08em] sm:text-[9rem]">
        {data.totalTitles}
      </p>

      <h2 className="max-w-sm text-2xl font-black leading-tight sm:text-3xl">
        NEW TITLES.
        <br />
        NEW POSSIBILITIES.
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
          Your taste has a pattern
        </p>

        <div className="rounded-3xl border border-white/15 bg-black/20 px-5 py-4 backdrop-blur-sm">
          <IoSparkles className="mx-auto h-8 w-8 text-purple-200" />
        </div>

        <h2 className="max-w-full break-words text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
          {data.topGenre}
        </h2>

        <div className="mt-2 h-1.5 w-20 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />

        <p className="max-w-xs text-base leading-7 text-gray-300">
          Your top genre this month.
        </p>

        {data.vibe && (
          <p className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-200">
            Your vibe:{" "}
            <span className="font-black text-white">{data.vibe}</span>
          </p>
        )}
      </div>
    ),

    // 4. Watch time
    <div
      key="4"
      className={`${base} bg-[#071B2A]`}
    >
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
        Your estimated watch time from the titles you added.
      </p>

      <div className="mt-2 rounded-full border border-cyan-200/15 bg-black/20 px-4 py-2 text-xs font-semibold text-cyan-100/80">
        Every title has a story.
      </div>
    </div>,

    // 5. Highest-rated pick
    data.highestRatedOfPeriod && (
      <div
        key="5"
        className={`${base} bg-[#260E1C]`}
      >
        <div className={`${glow} -right-24 -top-24 bg-pink-500/30`} />
        <div className={`${glow} -bottom-28 -left-24 bg-purple-600/30`} />

        <p className="text-xs font-black uppercase tracking-[0.3em] text-pink-200">
          The one that stood out
        </p>

        <div className="rounded-3xl border border-pink-200/15 bg-pink-300/10 p-5">
          <IoHeart className="h-10 w-10 text-pink-300" />
        </div>

        <h2 className="max-w-lg break-words text-3xl font-black leading-tight sm:text-5xl">
          {data.highestRatedOfPeriod.title ||
            data.highestRatedOfPeriod.name}
        </h2>

        <div className="flex items-center gap-2 rounded-full border border-pink-200/15 bg-black/20 px-5 py-3">
          <IoHeart className="h-4 w-4 text-pink-300" />
          <p className="text-lg font-black">
            {data.highestRatedOfPeriod.rating}/10
          </p>
          <span className="text-sm text-gray-300">hearts</span>
        </div>

        <p className="max-w-xs text-sm leading-6 text-gray-300">
          Your highest-rated pick from this period.
        </p>
      </div>
    ),

    // 6. Closing
    <div
      key="6"
      className={`${base} bg-[#080D17]`}
    >
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
        Another month of stories, worlds, and characters worth remembering.
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

export default MonthlyWrapped;
