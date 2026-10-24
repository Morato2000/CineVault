import { Link } from "react-router-dom";
import {
  IoCalendarOutline,
  IoSparkles,
  IoPlayCircleOutline,
} from "react-icons/io5";
import BackButton from "../components/common/BackButton";

function WrappedLanding() {
  return (
    <div className="px-8 pb-16">
      <BackButton />

      <h1 className="mt-4 text-2xl font-bold text-white">
        Your CineVault Wrapped
      </h1>
      <p className="mt-1 text-gray-400">
        A personal recap of your watch habits.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/wrapped/monthly"
          className="rounded-2xl bg-linear-to-br from-[#A855F7] to-[#3B82F6] p-6 text-white transition hover:opacity-90"
        >
          <IoCalendarOutline className="h-8 w-8" />
          <h2 className="mt-4 text-xl font-bold">Monthly Recap</h2>
          <p className="mt-1 text-sm text-white/80">
            This month's genres, ratings, and watch time.
          </p>
        </Link>

        <Link
          to="/wrapped/yearly"
          className="rounded-2xl bg-[radial-gradient(circle_at_top_left,#A855F7,#1a0b2e)] p-6 text-white transition hover:opacity-90"
        >
          <IoSparkles className="h-8 w-8" />
          <h2 className="mt-4 text-xl font-bold">Year in Review</h2>
          <p className="mt-1 text-sm text-white/80">
            Your full year, wrapped — top genre, busiest month, and more.
          </p>
        </Link>
      </div>

      {/* <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2">
          <IoPlayCircleOutline className="h-6 w-6 text-purple-300" />
          <h2 className="text-lg font-bold text-white">Preview mode</h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          Explore the Wrapped stories with sample data to test the slides,
          animations, and navigation without changing your real watchlist.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/wrapped/yearly?preview=true"
            className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-center text-sm font-bold text-purple-200 transition hover:bg-purple-500/20"
          >
            Preview Yearly Wrapped
          </Link>

          <Link
            to="/wrapped/monthly?preview=true"
            className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-center text-sm font-bold text-blue-200 transition hover:bg-blue-500/20"
          >
            Preview Monthly Wrapped
          </Link>
        </div>
      </div> */}
    </div>
  );
}

export default WrappedLanding;