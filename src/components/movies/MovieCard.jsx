import { getTmdbImage } from "../../utils/tmdbImage";
import posterPlaceholder from "../../assets/images/Image Card Placeholder.png";
import tmdbStar from "../../assets/icons/tmdb-star.svg";

function MovieCard({ movie, type }) {
  const title = movie.title || movie.name;

  const mediaType = type || (movie.media_type === "tv" ? "TV Series" : "Movie");

  const rating = movie.vote_average?.toFixed(1);

  const startYear = (movie.release_date || movie.first_air_date || "").slice(
    0,
    4,
  );

  const endYear = movie.last_air_date ? movie.last_air_date.slice(0, 4) : "";

  let dateDisplay;

  if (mediaType === "TV Series") {
    if (movie.status === "Ended" && endYear) {
      dateDisplay = `${startYear} - ${endYear}`;
    } else if (startYear) {
      dateDisplay = `${startYear} - Ongoing`;
    } else {
      dateDisplay = "N/A";
    }
  } else {
    dateDisplay = startYear || "N/A";
  }

  const poster = getTmdbImage(movie.poster_path);

  return (
    <div className="group relative h-[360px] w-[240px] shrink-0 overflow-hidden rounded-[22px] bg-[#111827]">
      {/* Poster */}
      {poster ? (
        <img
          src={poster}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={posterPlaceholder}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Overall image shading */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Bottom cinematic gradient */}
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black via-black/75 to-transparent" />

      {/* Top-left personal rating */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="text-lg leading-none text-red-500">♥</span>

        <span className="text-sm font-medium text-white">9.8</span>
      </div>

      {/* More options */}
      <button
        type="button"
        aria-label={`More options for ${title}`}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-2xl leading-none text-white transition-opacity duration-200 hover:opacity-70"
      >
        ⋮
      </button>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        {/* Title */}
        <h3 className="text-xl font-bold leading-tight text-white">{title}</h3>

        {/* Year */}
        <p className="mt-4 text-base text-gray-200">{dateDisplay}</p>

        {/* Category + TMDB rating */}
        <div className="mt-7 flex items-center justify-between">
          {/* Category */}
          <span
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white backdrop-blur-sm ${
              mediaType === "TV Series"
                ? "bg-[rgba(22,163,74,0.2)]"
                : "bg-[rgba(147,51,234,0.2)]"
            }`}
          >
            {mediaType}
          </span>

          {/* TMDB rating */}
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[rgba(251,191,36,0.15)] px-4 py-2 backdrop-blur-sm">
            <img src={tmdbStar} alt="" className="h-4 w-5 shrink-0" />

            <span className="flex h-5 items-center text-base font-semibold leading-none text-lg text-white">
              {rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
