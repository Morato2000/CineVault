
import { Link } from "react-router-dom";
import { FiBookmark, FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

export function WatchlistWaitingCard({ className = "" }) {
  return (
    <div
      className={`group relative w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#0B0F1A] p-5 shadow-xl shadow-black/30 transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-950/20 ${className}`}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl transition-all duration-500 group-hover:bg-purple-500/20" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/15 to-blue-500/15">
            <FiBookmark className="text-2xl text-purple-400" />
          </div>

          <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
            Your next chapter
          </span>
        </div>

        <h3 className="mt-5 text-lg font-bold tracking-tight text-white">
          Your watchlist is waiting.
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Keep every movie and show you want to watch in one place. Your
          personal collection stays in sync across devices.
        </p>

        <div className="mt-5 space-y-3">
          <Link
            to="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#3B82F6] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition-all duration-300 hover:brightness-110 hover:shadow-purple-700/30 active:scale-[0.98]"
          >
            Create Account
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/explore"
            className="flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-indigo-500/30 hover:bg-white/[0.06] hover:text-white"
          >
            Explore Movies
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-400 transition-colors hover:text-purple-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export function SaveWhatYouLoveCard({ className = "" }) {
  const items = [
    "Build your personal watchlist",
    "Save your favourite titles",
    "Track your viewing statistics",
    "Get personalised recommendations",
  ];

  return (
    <div
      className={`group relative w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#0B0F1A] p-5 shadow-xl shadow-black/30 transition-all duration-300 hover:border-blue-500/40 hover:shadow-blue-950/20 ${className}`}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl transition-all duration-500 group-hover:bg-blue-500/20" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-purple-500/15">
            <FaStar className="text-lg text-purple-400" />
          </div>

          <div>
            <h3 className="text-base font-bold tracking-tight text-white">
              Make it yours.
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Your movies. Your collection.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 text-sm text-gray-300"
            >
              <FiCheckCircle className="shrink-0 text-sm text-purple-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-indigo-500/15 bg-gradient-to-r from-purple-500/[0.07] to-blue-500/[0.07] p-3">
          <div className="flex items-center gap-2">
            <FiLock className="shrink-0 text-purple-400" />
            <p className="text-xs leading-relaxed text-gray-400">
              Sign in to unlock your personal collection and keep your activity
              saved.
            </p>
          </div>
        </div>

        <Link
          to="/register"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#3B82F6] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition-all duration-300 hover:brightness-110 hover:shadow-purple-700/30 active:scale-[0.98]"
        >
          Get Started
          <FiArrowRight />
        </Link>

        <p className="mt-4 text-center text-xs text-gray-500">
          Already a member?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-400 transition-colors hover:text-purple-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
