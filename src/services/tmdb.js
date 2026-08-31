const BASE_URL = "https://api.themoviedb.org/3";

const token = import.meta.env.VITE_TMDB_TOKEN;

const options = {
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
};

export async function getTrendingMovies() {
  const response = await fetch(`${BASE_URL}/trending/all/week`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }

  const data = await response.json();

  return data.results;
}

export async function getTvDetails(id) {
  const response = await fetch(`${BASE_URL}/tv/${id}`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch TV details");
  }

  return response.json();
}

export async function getTopRatedSeries() {
  const response = await fetch(`${BASE_URL}/tv/top_rated`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch top rated series");
  }

  const data = await response.json();

  const seriesWithDetails = await Promise.all(
    data.results.map(async (series) => {
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
    })
  );

  return seriesWithDetails;
}

export async function getTopRatedMovies() {
  const response = await fetch(`${BASE_URL}/movie/top_rated`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch top rated movies");
  }

  const data = await response.json();

  return data.results;
}

export async function getPopularMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch popular movies");
  }

  const data = await response.json();

  return data.results;
}

export async function getPopularSeries() {
  const response = await fetch(`${BASE_URL}/tv/popular`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch popular series");
  }

  const data = await response.json();

  return data.results;
}

export async function getUpcomingMovies() {
  const today = new Date().toISOString().split("T")[0];

  const [moviesRes, tvRes] = await Promise.all([
    fetch(
      `${BASE_URL}/discover/movie?region=US&sort_by=primary_release_date.asc&primary_release_date.gte=${today}&with_release_type=2|3&vote_count.gte=1`,
      options
    ),
    fetch(
      `${BASE_URL}/discover/tv?sort_by=first_air_date.asc&first_air_date.gte=${today}`,
      options
    ),
  ]);

  if (!moviesRes.ok || !tvRes.ok) {
    throw new Error("Failed to fetch upcoming titles");
  }

  const [moviesData, tvData] = await Promise.all([
    moviesRes.json(),
    tvRes.json(),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return [...movies, ...series].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date;
    const dateB = b.release_date || b.first_air_date;
    return dateA.localeCompare(dateB);
  });
}

export async function getTrendingAllToday() {
  const response = await fetch(`${BASE_URL}/trending/all/day`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch trending titles");
  }

  const data = await response.json();

  return data.results;
}

export async function getTopRatedAll() {
  const [moviesRes, tvRes] = await Promise.all([
    fetch(`${BASE_URL}/movie/top_rated`, options),
    fetch(`${BASE_URL}/tv/top_rated`, options),
  ]);

  if (!moviesRes.ok || !tvRes.ok) {
    throw new Error("Failed to fetch top rated titles");
  }

  const [moviesData, tvData] = await Promise.all([
    moviesRes.json(),
    tvRes.json(),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return [...movies, ...series].sort(
    (a, b) => b.vote_average - a.vote_average
  );
}

export async function getNewReleases() {
  const [moviesRes, tvRes] = await Promise.all([
    fetch(`${BASE_URL}/movie/now_playing`, options),
    fetch(`${BASE_URL}/tv/on_the_air`, options),
  ]);

  if (!moviesRes.ok || !tvRes.ok) {
    throw new Error("Failed to fetch new releases");
  }

  const [moviesData, tvData] = await Promise.all([
    moviesRes.json(),
    tvRes.json(),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return [...movies, ...series].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";
    return dateB.localeCompare(dateA);
  });
}

export async function getByGenre(movieGenreId, tvGenreId) {
  const [moviesRes, tvRes] = await Promise.all([
    fetch(
      `${BASE_URL}/discover/movie?with_genres=${movieGenreId}&sort_by=popularity.desc`,
      options
    ),
    fetch(
      `${BASE_URL}/discover/tv?with_genres=${tvGenreId}&sort_by=popularity.desc`,
      options
    ),
  ]);

  if (!moviesRes.ok || !tvRes.ok) {
    throw new Error("Failed to fetch genre titles");
  }

  const [moviesData, tvData] = await Promise.all([
    moviesRes.json(),
    tvRes.json(),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return [...movies, ...series].sort((a, b) => b.popularity - a.popularity);
}

export async function getAnime() {
  const [moviesRes, tvRes] = await Promise.all([
    fetch(
      `${BASE_URL}/discover/movie?with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
      options
    ),
    fetch(
      `${BASE_URL}/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc`,
      options
    ),
  ]);

  if (!moviesRes.ok || !tvRes.ok) {
    throw new Error("Failed to fetch anime");
  }

  const [moviesData, tvData] = await Promise.all([
    moviesRes.json(),
    tvRes.json(),
  ]);

  const movies = moviesData.results.map((item) => ({
    ...item,
    media_type: "movie",
  }));

  const series = tvData.results.map((item) => ({
    ...item,
    media_type: "tv",
  }));

  return [...movies, ...series].sort((a, b) => b.popularity - a.popularity);
}

export async function getKDrama() {
  const response = await fetch(
    `${BASE_URL}/discover/tv?with_origin_country=KR&sort_by=popularity.desc`,
    options
  );

  if (!response.ok) {
    throw new Error("Failed to fetch K-Drama");
  }

  const data = await response.json();

  return data.results.map((item) => ({ ...item, media_type: "tv" }));
}

export const GENRES = [
  { label: "Action", movieId: 28, tvId: 10759 },
  { label: "Comedy", movieId: 35, tvId: 35 },
  { label: "Drama", movieId: 18, tvId: 18 },
  { label: "Horror", movieId: 27, tvId: 9648 },
  { label: "Romance", movieId: 10749, tvId: 10766 },
  { label: "Sci-Fi", movieId: 878, tvId: 10765 },
  { label: "Animation", movieId: 16, tvId: 16 },
  { label: "Thriller", movieId: 53, tvId: 80 },
];
export async function searchMulti(query, page = 1) {
  const response = await fetch(
    `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&page=${page}`,
    options
  );

  if (!response.ok) {
    throw new Error("Failed to search");
  }

  const data = await response.json();

  return {
    results: data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ),
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}