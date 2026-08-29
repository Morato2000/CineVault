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
export async function getTopRatedSeries() {
  const response = await fetch(
    `${BASE_URL}/tv/top_rated`,
    options
  );

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
        console.error(
          `Failed to fetch details for ${series.name}:`,
          error
        );

        return series;
      }
    })
  );

  return seriesWithDetails;
}
export async function getTvDetails(id) {
  const response = await fetch(`${BASE_URL}/tv/${id}`, options);

  if (!response.ok) {
    throw new Error("Failed to fetch TV details");
  }

  return response.json();
}
export async function getTopRatedMovies() {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated`,
    options
  );

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