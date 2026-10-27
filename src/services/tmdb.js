const BASE_URL = "/api/tmdb";
// ============================================
// CACHE CONFIGURATION
// ============================================

const CACHE_TTL = {
  TRENDING: 15 * 60 * 1000, // 15 minutes
  POPULAR: 30 * 60 * 1000, // 30 minutes
  UPCOMING: 30 * 60 * 1000, // 30 minutes
  NEW_RELEASES: 30 * 60 * 1000, // 30 minutes
  GENRE: 30 * 60 * 1000, // 30 minutes
  TOP_RATED: 60 * 60 * 1000, // 1 hour
  TITLE_DETAILS: 60 * 60 * 1000, // 1 hour
  TV_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  SEASON_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH: 5 * 60 * 1000, // 5 minutes
};

const MAX_CACHE_ENTRIES = 200;

const requestCache = new Map();

// ============================================
// REUSABLE REQUEST CACHE
// ============================================

async function fetchCached(url, ttl) {
  const now = Date.now();

  const cached = requestCache.get(url);

  if (cached && cached.expiresAt > now) {
    // Refresh insertion order for LRU eviction.
    requestCache.delete(url);
    requestCache.set(url, cached);

    return cached.promise;
  }

  if (cached) {
    requestCache.delete(url);
  }

  const entry = {
    expiresAt: Infinity,
    promise: null,
  };

  const requestUrl = new URL(url, window.location.origin);

  const tmdbPath = requestUrl.pathname.replace(/^\/api\/tmdb\/?/, "");

  const proxyUrl = new URL(BASE_URL, window.location.origin);

  proxyUrl.searchParams.set("path", tmdbPath);

  requestUrl.searchParams.forEach((value, key) => {
    proxyUrl.searchParams.append(key, value);
  });

  const request = fetch(proxyUrl).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `TMDB request failed (${response.status}): ${
          response.statusText || "Unknown error"
        }`,
      );
    }

    return response.json();
  });

  entry.promise = request;

  requestCache.set(url, entry);

  try {
    const data = await request;

    // Only update the entry if it hasn't been replaced.
    if (requestCache.get(url) === entry) {
      entry.expiresAt = Date.now() + ttl;

      // Remove oldest entries when the cache is full.
      while (requestCache.size > MAX_CACHE_ENTRIES) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
    }

    return data;
  } catch (error) {
    // Failed requests should never remain cached.
    if (requestCache.get(url) === entry) {
      requestCache.delete(url);
    }

    throw error;
  }
}

// Clear the entire cache when needed.
export function clearTmdbCache() {
  requestCache.clear();
}

// Clear a specific cached request by its complete URL.
export function clearTmdbCacheEntry(url) {
  requestCache.delete(url);
}

// ============================================
// DATE UTILITIES
// ============================================

// Uses the user's local calendar date instead of UTC.
function getLocalDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================
// TV DETAILS
// ============================================

export async function getTvDetails(id) {
  return fetchCached(`${BASE_URL}/tv/${id}`, CACHE_TTL.TV_DETAILS);
}

export async function addTvDetails(results) {
  return Promise.all(
    results.map(async (series) => {
      try {
        const details = await getTvDetails(series.id);

        return {
          ...series,
          first_air_date: details.first_air_date,
          status: details.status,
          last_air_date: details.last_air_date,
        };
      } catch (error) {
        console.error(`Failed to fetch details for ${series.name}:`, error);

        return series;
      }
    }),
  );
}

// ============================================
// TRENDING
// ============================================

export async function getTrendingMovies() {
  const data = await fetchCached(
    `${BASE_URL}/trending/all/week`,
    CACHE_TTL.TRENDING,
  );

  // Exclude TV shows and people.
  const movies = data.results.filter((item) => item.media_type === "movie");

  const series = await addTvDetails(
    data.results.filter((item) => item.media_type === "tv"),
  );

  return [...movies, ...series];
}

export async function getTrendingAllToday() {
  const data = await fetchCached(
    `${BASE_URL}/trending/all/day`,
    CACHE_TTL.TRENDING,
  );

  const movies = data.results.filter((item) => item.media_type === "movie");

  const series = await addTvDetails(
    data.results.filter((item) => item.media_type === "tv"),
  );

  return [...movies, ...series];
}

// ============================================
// TOP RATED
// ============================================

export async function getTopRatedSeries() {
  const data = await fetchCached(`${BASE_URL}/tv/top_rated`, CACHE_TTL.GENRE);

  const series = data.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return addTvDetails(series);
}
export async function getTopRatedMovies() {
  const data = await fetchCached(
    `${BASE_URL}/movie/top_rated`,
    CACHE_TTL.TOP_RATED,
  );

  return data.results;
}

export async function getTopRatedAll() {
  const [moviesData, tvData] = await Promise.all([
    fetchCached(`${BASE_URL}/movie/top_rated`, CACHE_TTL.TOP_RATED),
    fetchCached(`${BASE_URL}/tv/top_rated`, CACHE_TTL.TOP_RATED),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  const seriesWithDetails = await addTvDetails(series);

  return [...movies, ...seriesWithDetails].sort(
    (a, b) => b.vote_average - a.vote_average,
  );
}

// ============================================
// POPULAR
// ============================================

export async function getPopularMovies() {
  const data = await fetchCached(
    `${BASE_URL}/movie/popular`,
    CACHE_TTL.POPULAR,
  );

  return data.results;
}

export async function getPopularSeries() {
  const data = await fetchCached(`${BASE_URL}/tv/popular`, CACHE_TTL.POPULAR);

  return addTvDetails(data.results);
}

// ============================================
// UPCOMING RELEASES
// ============================================

export async function getUpcomingMovies() {
  const today = getLocalDate();

  const [moviesData, tvData] = await Promise.all([
    fetchCached(
      `${BASE_URL}/discover/movie?region=US&sort_by=primary_release_date.asc&primary_release_date.gte=${today}&with_release_type=2|3&vote_count.gte=1`,
      CACHE_TTL.UPCOMING,
    ),

    fetchCached(
      `${BASE_URL}/discover/tv?sort_by=first_air_date.asc&first_air_date.gte=${today}`,
      CACHE_TTL.UPCOMING,
    ),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  const seriesWithDetails = await addTvDetails(series);

  return [...movies, ...seriesWithDetails].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";

    return dateA.localeCompare(dateB);
  });
}

// ============================================
// NEW RELEASES
// ============================================

export async function getNewReleases() {
  const [moviesData, tvData] = await Promise.all([
    fetchCached(`${BASE_URL}/movie/now_playing`, CACHE_TTL.NEW_RELEASES),

    fetchCached(`${BASE_URL}/tv/on_the_air`, CACHE_TTL.NEW_RELEASES),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  const seriesWithDetails = await addTvDetails(series);

  return [...movies, ...seriesWithDetails].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";

    return dateB.localeCompare(dateA);
  });
}

// ============================================
// GENRE DISCOVERY
// ============================================

export async function getByGenre(movieGenreId, tvGenreId) {
  const requests = [
    movieGenreId != null
      ? fetchCached(
          `${BASE_URL}/discover/movie?with_genres=${encodeURIComponent(movieGenreId)}&sort_by=popularity.desc`,
          CACHE_TTL.GENRE,
        )
      : Promise.resolve({ results: [] }),

    tvGenreId != null
      ? fetchCached(
          `${BASE_URL}/discover/tv?with_genres=${encodeURIComponent(tvGenreId)}&sort_by=popularity.desc`,
          CACHE_TTL.GENRE,
        )
      : Promise.resolve({ results: [] }),
  ];

  const [moviesData, tvData] = await Promise.all(requests);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  const seriesWithDetails = await addTvDetails(series);

  return [...movies, ...seriesWithDetails].sort(
    (a, b) => b.popularity - a.popularity,
  );
}

// ============================================
// ANIME
// ============================================

export async function getAnime() {
  const [moviesData, tvData] = await Promise.all([
    fetchCached(
      `${BASE_URL}/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
      CACHE_TTL.GENRE,
    ),

    fetchCached(
      `${BASE_URL}/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
      CACHE_TTL.GENRE,
    ),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  const seriesWithDetails = await addTvDetails(series);

  return [...movies, ...seriesWithDetails].sort(
    (a, b) => b.popularity - a.popularity,
  );
}

// ============================================
// K-DRAMA
// ============================================

export async function getKDrama() {
  const data = await fetchCached(
    `${BASE_URL}/discover/tv?with_origin_country=KR&with_genres=18&sort_by=popularity.desc`,
    CACHE_TTL.GENRE,
  );

  const series = data.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return addTvDetails(series);
}

// ============================================
// GENRE DEFINITIONS
// ============================================

export const GENRES = [
  { label: "Action", movieId: 28, tvId: 10759 },
  { label: "Comedy", movieId: 35, tvId: 35 },
  { label: "Drama", movieId: 18, tvId: 18 },

  // TMDB has no direct TV genre equivalent for these.
  { label: "Horror", movieId: 27, tvId: null },
  { label: "Romance", movieId: 10749, tvId: null },
  { label: "Thriller", movieId: 53, tvId: null },

  { label: "Sci-Fi", movieId: 878, tvId: 10765 },
  { label: "Animation", movieId: 16, tvId: 16 },
];

// ============================================
// MULTI SEARCH
// ============================================

export async function searchMulti(query, page = 1) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      results: [],
      totalPages: 0,
      totalResults: 0,
    };
  }

  const data = await fetchCached(
    `${BASE_URL}/search/multi?query=${encodeURIComponent(normalizedQuery)}&include_adult=false&page=${page}`,
    CACHE_TTL.SEARCH,
  );

  const results = data.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv",
  );

  const tvResults = await addTvDetails(
    results.filter((item) => item.media_type === "tv"),
  );

  const tvById = new Map(tvResults.map((item) => [item.id, item]));

  return {
    results: results.map((item) => tvById.get(item.id) || item),
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

// ============================================
// FULL TITLE DETAILS
// ============================================

export async function getTitleDetails(mediaType, id) {
  if (mediaType !== "movie" && mediaType !== "tv") {
    throw new Error("Invalid media type. Expected movie or tv.");
  }

  const appends =
    mediaType === "tv"
      ? "aggregate_credits,recommendations,videos,watch/providers,reviews"
      : "credits,recommendations,videos,watch/providers,reviews";

  return fetchCached(
    `${BASE_URL}/${mediaType}/${id}?append_to_response=${appends}`,
    CACHE_TTL.TITLE_DETAILS,
  );
}

// ============================================
// SEASON DETAILS
// ============================================

export async function getSeasonDetails(tvId, seasonNumber) {
  return fetchCached(
    `${BASE_URL}/tv/${tvId}/season/${seasonNumber}`,
    CACHE_TTL.SEASON_DETAILS,
  );
}
