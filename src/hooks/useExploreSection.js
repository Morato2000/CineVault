import { useEffect, useMemo, useState } from "react";

export function useExploreSection(
  fetchFn,
  activeFilter,
  activeGenre,
  matchesTypeFilter,
  matchesGenre,
  deps = []
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const movies = useMemo(
    () =>
      data.filter(
        (item) =>
          matchesTypeFilter(item, activeFilter) && matchesGenre(item, activeGenre)
      ),
    [data, activeFilter, activeGenre]
  );

  return { movies, loading, error };
}