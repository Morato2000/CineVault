import { FiSearch, FiBell } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function TopNav() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="px-8 py-8">
      <div className="flex items-center justify-between gap-8">
        {/* Search */}
        <div className="flex h-14 flex-1 max-w-xl items-center rounded-full bg-[#202A40] px-5">
          <FiSearch className="mr-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search movies, anime..."
            className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Right side */}
        {isLoggedIn ? (
          <div className="flex items-center gap-5">
            <button aria-label="Notifications" className="text-2xl text-white">
              <FiBell className="h-6 w-6" />
            </button>
            <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-600">
              {/* avatar image goes here once profile data exists */}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <button className="rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-7 py-3 font-semibold text-white">
              Sign Up
            </button>
            <button className="rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] p-[1px]">
              <span className="block rounded-full bg-[#080D17] px-7 py-3 font-semibold text-white">
                Login
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default TopNav;