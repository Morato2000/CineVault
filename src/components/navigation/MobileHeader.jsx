import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiBell, FiX } from "react-icons/fi";
import { IoMenu } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { searchMulti } from "../../services/tmdb";
import { getTmdbImage } from "../../utils/tmdbImage";
import brandLogo from "../../assets/icons/BRAND.svg";

function MobileHeader({ onMenuClick }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    setQuery("");
    setResults([]);
    setTotalResults(0);
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchMulti(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results.slice(0, 6));
          setTotalResults(data.totalResults);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setTotalResults(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToFullResults = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setTotalResults(0);
  };

  return (
    <header className="px-4 pb-4 pt-5 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onMenuClick} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center text-white">
          <IoMenu className="h-6 w-6" />
        </button>

        <Link to="/">
          <img src={brandLogo} alt="CineVault" className="h-8 w-auto" />
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="relative text-white">
              <FiBell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-purple-500" />
            </button>
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-600" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => navigate("/register")} className="rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-3 py-1.5 text-xs font-semibold text-white">
              Sign Up
            </button>
            <button type="button" onClick={() => navigate("/login")} className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white">
              Login
            </button>
          </div>
        )}
      </div>

      <div ref={wrapperRef} className="relative mt-4">
        <div className="flex h-12 items-center rounded-full bg-[#202A40] px-4">
          <FiSearch className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && goToFullResults()}
            placeholder="Search movies, anime..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-400"
          />
          {query && (
            <>
              <span className="mr-1 shrink-0 text-xs text-gray-500">{loading ? "..." : totalResults} Results</span>
              <button type="button" onClick={clearSearch} aria-label="Clear search" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-300">
                <FiX className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {isOpen && query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-14 z-30 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-3 shadow-xl shadow-black/40">
            {results.length === 0 && !loading && (
              <p className="px-3 py-4 text-center text-sm text-gray-400">No results for "{query}"</p>
            )}

            {results.map((item) => {
              const title = item.title || item.name;
              const date = item.release_date || item.first_air_date;
              const year = date ? date.slice(0, 4) : "";
              const poster = getTmdbImage(item.poster_path, "w92");

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setIsOpen(false); navigate(`/${item.media_type}/${item.id}`); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5"
                >
                  {poster ? (
                    <img src={poster} alt="" className="h-14 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-14 w-10 shrink-0 rounded-md bg-white/10" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-gray-400">{year} • {item.media_type === "tv" ? "TV Series" : "Movies"}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-amber-400">★ {item.vote_average?.toFixed(1)}</span>
                </button>
              );
            })}

            {results.length > 0 && (
              <button type="button" onClick={goToFullResults} className="mt-2 w-full rounded-xl border-t border-white/10 pt-3 text-center text-sm font-medium text-purple-400">
                View all results →
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default MobileHeader;