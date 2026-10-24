
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const token = process.env.TMDB_API_TOKEN;

  if (!token) {
    console.error("TMDB_API_TOKEN is not configured.");

    return res.status(500).json({
      error: "TMDB service is not configured.",
    });
  }

  try {
    const tmdbPath = req.query.path;

    if (
      typeof tmdbPath !== "string" ||
      !tmdbPath ||
      !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(tmdbPath)
    ) {
      return res.status(400).json({
        error: "Invalid or missing TMDB endpoint.",
      });
    }

    const url = new URL(`${TMDB_BASE_URL}/${tmdbPath}`);

    for (const [key, value] of Object.entries(req.query)) {
      if (key === "path") continue;

      if (Array.isArray(value)) {
        value.forEach((item) =>
          url.searchParams.append(key, item)
        );
      } else if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("TMDB proxy error:", error);

    return res.status(502).json({
      error: "Unable to communicate with TMDB.",
    });
  }
}
