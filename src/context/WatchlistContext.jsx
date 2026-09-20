import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext(null);
const STORAGE_KEY = "cinevault_watchlist";

export function WatchlistProvider({ children }) {
  const clearWatchlist = () => setItems([]);

  const importWatchlist = (importedItems) => {
    if (!Array.isArray(importedItems)) return;

    setItems((prev) => {
      const merged = [...prev];

      importedItems.forEach((item) => {
        const exists = merged.some(
          (i) => i.id === item.id && i.media_type === item.media_type,
        );
        if (!exists) {
          merged.push(item);
        }
      });

      return merged;
    });
  };
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage unavailable (private browsing, quota, etc.) — fail silently
    }
  }, [items]);

  const isInWatchlist = (id, mediaType) =>
    items.some((item) => item.id === id && item.media_type === mediaType);

  const addToWatchlist = (item) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id && i.media_type === item.media_type)
        ? prev
        : [...prev, { ...item, addedAt: Date.now() }],
    );
  };

  const removeFromWatchlist = (id, mediaType) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.media_type === mediaType)),
    );
  };

  const toggleWatchlist = (item) => {
    if (isInWatchlist(item.id, item.media_type)) {
      removeFromWatchlist(item.id, item.media_type);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        items,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        clearWatchlist,
        importWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
}
