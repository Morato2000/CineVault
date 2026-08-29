import { FiBookmark, FiLock } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

export function WatchlistWaitingCard({ className = "" }) {
  return (
    <div
      className={`w-72 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 shadow-xl shadow-black/40 ${className}`}
    >
      <FiBookmark className="text-2xl text-purple-400" />

      <h3 className="mt-3 text-base font-bold text-white">
        Your watchlist is waiting
      </h3>

      <p className="mt-2 text-sm text-gray-400">
        Save titles, create lists and sync across devices.
      </p>

      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-gradient-to-b from-[#A855F7] to-[#3B82F6] py-2.5 text-sm font-semibold text-white"
      >
        Create Account →
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        No account?{" "}
        <span className="font-medium text-purple-400">Create account</span>
      </p>
    </div>
  );
}

export function SaveWhatYouLoveCard({ className = "" }) {
  const items = [
    "Add titles to your watchlist",
    "Mark favorites",
    "Track your stats",
    "Personalized picks",
    "And many more...",
  ];

  return (
    <div
      className={`w-72 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 shadow-xl shadow-black/40 ${className}`}
    >
      <div className="flex items-center gap-2">
        <FaStar className="text-purple-400" />
        <h3 className="text-base font-bold text-white">Save what you love</h3>
      </div>

      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-gray-300"
          >
            <FaStar className="shrink-0 text-xs text-purple-400" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-gray-400">
        <FiLock className="shrink-0" />
        Only available after Sign In
      </div>
    </div>
  );
}