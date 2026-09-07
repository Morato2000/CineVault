import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IoStar,
  IoTrendingUpOutline,
  IoPeopleOutline,
  IoCheckmarkCircleOutline,
  IoGlobeOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoFilmOutline,
  IoAlbumsOutline,
  IoLocationOutline,
  IoLanguageOutline,
  IoBusinessOutline,
  IoEarthOutline,
  IoCashOutline,
  IoTrendingDownOutline,
  IoOpenOutline,
} from "react-icons/io5";
import BackButton from "../components/common/BackButton";
import PosterFallback from "../components/common/PosterFallback";
import { getTitleDetails } from "../services/tmdb";
import { getTmdbImage } from "../utils/tmdbImage";
import { getGenreColor, hexToRgba } from "../constants/genreColors";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: hexToRgba(accent, 0.15), color: accent }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="flex items-center gap-2.5 text-gray-300">
        <Icon className="h-4 w-4 shrink-0 text-purple-400" />
        {label}
      </dt>
      <dd className="text-right font-semibold text-white">{value ?? "N/A"}</dd>
    </div>
  );
}

function FullInfo() {
  const { mediaType, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    window.scrollTo({ top: 0 });

    getTitleDetails(mediaType, id)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mediaType, id]);

  if (loading || !data) {
    return (
      <div className="px-8 pb-16">
        <BackButton />
        <div className="mt-6 h-64 w-full animate-pulse rounded-2xl bg-[#111827]" />
      </div>
    );
  }

  const title = data.title || data.name;
  const backdrop = getTmdbImage(data.backdrop_path, "original");
  const poster = getTmdbImage(data.poster_path, "w342");
  const money = (n) => (n ? `$${n.toLocaleString()}` : "N/A");

  return (
    <div className="px-8 pb-16">
      <BackButton />

      {/* Mini hero */}
      <div className="relative mt-4 h-56 overflow-hidden rounded-2xl">
        {backdrop ? (
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <PosterFallback title={title} className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#080D17] via-[#080D17]/50 to-black/20" />

        <div className="absolute inset-x-6 bottom-6 flex items-end gap-5">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="hidden h-32 w-22 rounded-xl object-cover shadow-2xl sm:block"
            />
          ) : (
            <PosterFallback title={title} className="hidden h-32 w-22 rounded-xl shadow-2xl sm:flex" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            {data.tagline && (
              <p className="mt-1 text-sm italic text-gray-300">"{data.tagline}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={IoStar}
          label="TMDB Rating"
          value={data.vote_average?.toFixed(1) ?? "N/A"}
          accent="#E2B637"
        />
        <StatCard
          icon={IoTrendingUpOutline}
          label="Popularity"
          value={data.popularity?.toFixed(0) ?? "N/A"}
          accent="#3458E0"
        />
        <StatCard
          icon={IoPeopleOutline}
          label="Vote Count"
          value={data.vote_count?.toLocaleString() ?? "N/A"}
          accent="#59A3A7"
        />
        {mediaType === "movie" && (
          <>
            <StatCard icon={IoCashOutline} label="Budget" value={money(data.budget)} accent="#4ADE80" />
            <StatCard
              icon={IoTrendingDownOutline}
              label="Revenue"
              value={money(data.revenue)}
              accent="#BF3EBA"
            />
          </>
        )}
      </div>

      {/* Genres, as real colored pills */}
      {data.genres?.length > 0 && (
        <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <h2 className="font-bold text-white">Genres</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.genres.map((g) => {
              const color = getGenreColor(g.name);
              return (
                <span
                  key={g.id}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md"
                  style={{
                    backgroundColor: hexToRgba(color, 0.3),
                    border: `1px solid ${hexToRgba(color, 0.8)}`,
                  }}
                >
                  {g.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Core details */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <h2 className="font-bold text-white">Details</h2>
          <dl className="mt-2 divide-y divide-white/5">
            <InfoRow
              icon={IoCheckmarkCircleOutline}
              label="Status"
              value={data.status}
            />
            <InfoRow
              icon={IoGlobeOutline}
              label="Original Title"
              value={data.original_title || data.original_name}
            />
            <InfoRow
              icon={IoLanguageOutline}
              label="Original Language"
              value={data.original_language?.toUpperCase()}
            />
            {mediaType === "movie" ? (
              <>
                <InfoRow icon={IoCalendarOutline} label="Release Date" value={data.release_date} />
                <InfoRow
                  icon={IoTimeOutline}
                  label="Runtime"
                  value={data.runtime ? `${data.runtime} Mins` : null}
                />
              </>
            ) : (
              <>
                <InfoRow icon={IoCalendarOutline} label="First Aired" value={data.first_air_date} />
                <InfoRow icon={IoCalendarOutline} label="Last Aired" value={data.last_air_date} />
                <InfoRow icon={IoFilmOutline} label="Episodes" value={data.number_of_episodes} />
                <InfoRow icon={IoAlbumsOutline} label="Seasons" value={data.number_of_seasons} />
                <InfoRow
                  icon={IoLocationOutline}
                  label="Country"
                  value={data.origin_country?.join(", ")}
                />
              </>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
          <h2 className="font-bold text-white">Production</h2>
          <dl className="mt-2 divide-y divide-white/5">
            <InfoRow
              icon={IoBusinessOutline}
              label="Companies"
              value={data.production_companies?.map((c) => c.name).join(", ") || "N/A"}
            />
            <InfoRow
              icon={IoEarthOutline}
              label="Countries"
              value={data.production_countries?.map((c) => c.name).join(", ")}
            />
            <InfoRow
              icon={IoLanguageOutline}
              label="Spoken Languages"
              value={data.spoken_languages?.map((l) => l.english_name).join(", ")}
            />
          </dl>

          {data.homepage && (
            <a
              href={data.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <IoOpenOutline className="h-4 w-4" />
              Visit Official Homepage
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default FullInfo;