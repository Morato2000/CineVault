import { getTmdbImage } from "../../utils/tmdbImage";
import tmdbStar from "../../assets/icons/tmdb-star.svg";

const SIZES = {
  md: {
    card: "h-[360px] w-[240px]",
    radius: "rounded-[22px]",
    padding: "p-5",
    title: "text-xl",
    dateGap: "mt-4",
    metaGap: "mt-7",
    date: "text-base",
    pill: "px-4 py-2 text-sm",
    ratingText: "text-lg",
    heart: "text-lg",
    heartLabel: "text-sm",
    menuBtn: "h-8 w-8 text-2xl",
  },
  sm: {
    card: "h-[270px] w-[180px]",
    radius: "rounded-2xl",
    padding: "p-3",
    title: "text-base",
    dateGap: "mt-1.5",
    metaGap: "mt-3",
    date: "text-xs",
    pill: "px-2.5 py-1 text-xs",
    ratingText: "text-sm",
    heart: "text-sm",
    heartLabel: "text-xs",
    menuBtn: "h-6 w-6 text-lg",
  },
};

function MovieCard({ movie, type, size = "md" }) {
  const s = SIZES[size];

  const title = movie.title || movie.name;
  const mediaType = type || (movie.media_type === "tv" ? "TV Series" : "Movie");
  const rating = movie.vote_average?.toFixed(1);

  const startYear = (movie.release_date || movie.first_air_date || "").slice(0, 4);
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
    <div
      className={`group relative ${s.card} shrink-0 overflow-hidden ${s.radius} bg-[#111827]`}
    >
      <img
        src={poster}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black via-black/75 to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-1.5">
        <span className={`${s.heart} leading-none text-red-500`}>♥</span>
        <span className={`${s.heartLabel} font-medium text-white`}>9.8</span>
      </div>

      <button
        type="button"
        aria-label={`More options for ${title}`}
        className={`absolute right-3 top-3 flex ${s.menuBtn} items-center justify-center leading-none text-white transition-opacity duration-200 hover:opacity-70`}
      >
        ⋮
      </button>

      <div className={`absolute inset-x-0 bottom-0 ${s.padding}`}>
        <h3 className={`${s.title} truncate font-bold leading-tight text-white`}>
          {title}
        </h3>

        <p className={`${s.dateGap} ${s.date} text-gray-200`}>{dateDisplay}</p>

        <div className={`${s.metaGap} flex items-center justify-between gap-2`}>
          <span
            className={`rounded-xl ${s.pill} font-medium text-white backdrop-blur-sm ${
              mediaType === "TV Series"
                ? "bg-[rgba(22,163,74,0.2)]"
                : "bg-[rgba(147,51,234,0.2)]"
            }`}
          >
            {mediaType}
          </span>

          <div
            className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[rgba(251,191,36,0.15)] ${s.pill} backdrop-blur-sm`}
          >
            <img src={tmdbStar} alt="" className="h-4 w-4 shrink-0" />
            <span className={`${s.ratingText} font-semibold leading-none text-white`}>
              {rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;