import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiBell, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { searchMulti } from "../../services/tmdb";
import { getTmdbImage } from "../../utils/tmdbImage";
import { useProfile } from "../../context/ProfileContext";

function highlightMatch(text, query) {
  if (!query.trim()) return text;

  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.trim().length);
  const after = text.slice(index + query.trim().length);

  return (
    <>
      {before}
      <span className="text-purple-400">{match}</span>
      {after}
    </>
  );
}

function TopNav() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    setQuery("");
    setResults([]);
    setTotalResults(0);
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setActiveIndex(-1);

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
          setResults(data.results.slice(0, 4));
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

  const goToResult = (item) => {
    setIsOpen(false);
    navigate(`/${item.media_type}/${item.id}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter") goToFullResults();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        goToResult(results[activeIndex]);
      } else {
        goToFullResults();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setTotalResults(0);
  };

  return (
    <header className="px-8 py-8">
      <div className="flex items-center justify-between gap-8">
        {/* Search */}
        <div ref={wrapperRef} className="relative max-w-xl flex-1">
          <div className="flex h-14 items-center rounded-full bg-[#202A40] px-5">
            <FiSearch className="mr-3 h-5 w-5 text-gray-400" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search movies, anime..."
              className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
            />

            {query && (
              <>
                <span className="mr-3 whitespace-nowrap text-sm text-gray-500">
                  {loading ? "..." : `${totalResults} Results`}
                </span>
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="flex h-8 w-10 items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-white/20"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && query.trim().length >= 2 && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-16 z-30 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-3 shadow-xl shadow-black/40"
            >
              {results.length === 0 && !loading && (
                <p className="px-3 py-4 text-center text-sm text-gray-400">
                  No results for "{query}"
                </p>
              )}

              {results.map((item, index) => {
                const title = item.title || item.name;
                const date = item.release_date || item.first_air_date;
                const year = date ? date.slice(0, 4) : "";
                const poster = getTmdbImage(item.poster_path, "w92");

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToResult(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${
                      index === activeIndex ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt=""
                        className="h-14 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-14 w-10 shrink-0 rounded-md bg-white/10" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-md font-semibold text-white">
                        {highlightMatch(title, query)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {year} •{" "}
                        {item.media_type === "tv" ? "TV Series" : "Movies"}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 text-md text-amber-400">
                      ★ {item.vote_average?.toFixed(1)}
                    </span>
                  </button>
                );
              })}

              {results.length > 0 && (
                <button
                  type="button"
                  onClick={goToFullResults}
                  className="mt-2 w-full rounded-xl border-t border-white/10 pt-3 text-center text-md font-medium text-purple-400 hover:text-purple-300"
                >
                  View all results →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        {isLoggedIn ? (
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Notifications"
              className="relative text-white"
            >
              <FiBell className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-purple-500" />
            </button>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-600">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-white">
                  {profile.displayName
                    ? profile.displayName.charAt(0).toUpperCase()
                    : "?"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <button className="rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-7 py-3 font-semibold text-white">
              Sign Up
            </button>

            <button className="rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] p-[1px]">
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
