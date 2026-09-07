import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "cinevault_favorites";

export function FavoritesProvider({ children }) {
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
      // localStorage unavailable — fail silently
    }
  }, [items]);

  const isFavorited = (id, mediaType) =>
    items.some((item) => item.id === id && item.media_type === mediaType);

  const addFavorite = (item) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id && i.media_type === item.media_type)
        ? prev
        : [...prev, { ...item, addedAt: Date.now() }]
    );
  };

  const removeFavorite = (id, mediaType) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.media_type === mediaType))
    );
  };

  const toggleFavorite = (item) => {
    if (isFavorited(item.id, item.media_type)) {
      removeFavorite(item.id, item.media_type);
    } else {
      addFavorite(item);
    }
  };

  const getRating = (id, mediaType) =>
    items.find((i) => i.id === id && i.media_type === mediaType)?.rating || 0;

  const setRating = (item, rating) => {
    setItems((prev) => {
      const exists = prev.some(
        (i) => i.id === item.id && i.media_type === item.media_type
      );

      if (exists) {
        return prev.map((i) =>
          i.id === item.id && i.media_type === item.media_type
            ? { ...i, rating }
            : i
        );
      }

      return [...prev, { ...item, rating, addedAt: Date.now() }];
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        items,
        isFavorited,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        getRating,
        setRating,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}