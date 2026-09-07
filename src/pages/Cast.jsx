import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { IoOptionsOutline, IoClose } from "react-icons/io5";
import BackButton from "../components/common/BackButton";
import { getTitleDetails } from "../services/tmdb";
import { getTmdbImage } from "../utils/tmdbImage";

// Departments in a sensible "most useful first" order — anything not listed
// here just falls in alphabetically after these.
const DEPARTMENT_PRIORITY = ["Directing", "Writing", "Production", "Sound", "Art", "Camera"];

function getCastList(data, mediaType) {
  if (mediaType === "tv") {
    return (data.aggregate_credits?.cast || []).map((c) => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path,
      role: c.roles?.[0]?.character || "",
    }));
  }
  return (data.credits?.cast || []).map((c) => ({
    id: c.id,
    name: c.name,
    profile_path: c.profile_path,
    role: c.character || "",
  }));
}

function getCrewList(data, mediaType) {
  const raw = mediaType === "tv" ? data.aggregate_credits?.crew || [] : data.credits?.crew || [];

  const byId = new Map();

  raw.forEach((c) => {
    const jobs = mediaType === "tv" ? c.jobs?.map((j) => j.job) || [c.department] : [c.job];
    const dept = c.department || "Other";

    if (byId.has(c.id)) {
      const existing = byId.get(c.id);
      existing.jobs.push(...jobs);
      existing.departments.add(dept);
    } else {
      byId.set(c.id, {
        id: c.id,
        name: c.name,
        profile_path: c.profile_path,
        jobs: [...jobs],
        departments: new Set([dept]),
      });
    }
  });

  const crew = Array.from(byId.values()).map((c) => ({
    ...c,
    role: c.jobs.join(", "),
    departments: Array.from(c.departments),
  }));

  return sortCrew(crew);
}

function sortCrew(crew) {
  return [...crew].sort((a, b) => {
    const aIsDirector = a.role.includes("Director") ? 0 : 1;
    const bIsDirector = b.role.includes("Director") ? 0 : 1;
    if (aIsDirector !== bIsDirector) return aIsDirector - bIsDirector;
    return a.name.localeCompare(b.name);
  });
}

function getAvailableDepartments(crew) {
  const set = new Set();
  crew.forEach((c) => c.departments.forEach((d) => set.add(d)));

  return Array.from(set).sort((a, b) => {
    const aIndex = DEPARTMENT_PRIORITY.indexOf(a);
    const bIndex = DEPARTMENT_PRIORITY.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

function PersonCard({ person }) {
  const photo = getTmdbImage(person.profile_path, "w300");
  const tmdbUrl = `https://www.themoviedb.org/person/${person.id}`;

  return (
    <a
      href={tmdbUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-2xl border border-white/10 bg-[#0B0F1A] p-3 transition-colors hover:border-purple-500/50"
    >
      {photo ? (
        <img
          src={photo}
          alt={person.name}
          className="aspect-3/4 w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex aspect-3/4 w-full items-center justify-center rounded-xl bg-white/10 text-2xl font-bold text-gray-400">
          {person.name.charAt(0)}
        </div>
      )}

      <p className="mt-3 truncate text-sm font-bold text-white group-hover:text-purple-300">
        {person.name}
      </p>
      <p className="truncate text-xs text-gray-400">{person.role || "—"}</p>
    </a>
  );
}

function Cast() {
  const { mediaType, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDept, setActiveDept] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const title = data?.title || data?.name;
  const cast = useMemo(() => (data ? getCastList(data, mediaType) : []), [data, mediaType]);
  const crew = useMemo(() => (data ? getCrewList(data, mediaType) : []), [data, mediaType]);
  const departments = useMemo(() => getAvailableDepartments(crew), [crew]);

  const filteredCrew = activeDept
    ? crew.filter((c) => c.departments.includes(activeDept))
    : crew;

  return (
    <div className="px-8 pb-16">
      <BackButton />

      <div className="mt-5">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {loading ? "Loading..." : title}
        </h1>
        <p className="mt-1 text-gray-400">Full Cast &amp; Crew</p>
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-3/4 w-full animate-pulse rounded-2xl bg-[#111827]" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* Cast */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-white">Cast ({cast.length})</h2>

            {cast.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No cast information available.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {cast.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}
          </section>

          {/* Crew */}
          <section className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">
                Crew ({filteredCrew.length}
                {activeDept ? ` of ${crew.length}` : ""})
              </h2>

              {departments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeDept && (
                    <button
                      type="button"
                      onClick={() => setActiveDept(null)}
                      className="flex items-center gap-1.5 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white"
                    >
                      {activeDept}
                      <IoClose className="h-4 w-4" />
                    </button>
                  )}

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFilterOpen((v) => !v)}
                      aria-haspopup="listbox"
                      aria-expanded={filterOpen}
                      className="flex items-center gap-2 rounded-full border border-[#477DF7]/70 px-5 py-2 text-sm font-semibold text-gray-200 hover:bg-white/10"
                    >
                      <IoOptionsOutline className="h-4 w-4" />
                      Filter
                    </button>

                    {filterOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setFilterOpen(false)}
                        />
                        <div
                          role="listbox"
                          className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-2 shadow-xl shadow-black/40"
                        >
                          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Department
                          </p>

                          {departments.map((dept) => (
                            <button
                              key={dept}
                              type="button"
                              role="option"
                              aria-selected={activeDept === dept}
                              onClick={() => {
                                setActiveDept(dept);
                                setFilterOpen(false);
                              }}
                              className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                                activeDept === dept
                                  ? "bg-white/10 text-white"
                                  : "text-gray-300 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {filteredCrew.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">
                {activeDept ? `No ${activeDept} crew found.` : "No crew information available."}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredCrew.map((person) => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Cast;