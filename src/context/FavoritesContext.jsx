import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

function rowToItem(row) {
  return {
    id: row.tmdb_id,
    media_type: row.media_type,
    title: row.title,
    poster_path: row.poster_path,
    vote_average: row.vote_average,
    genre_ids: row.genre_ids || [],
    rating: Number(row.rating),
    addedAt: new Date(row.added_at).getTime(),
  };
}

function itemToRow(item, userId, rating) {
  return {
    user_id: userId,
    tmdb_id: item.id,
    media_type: item.media_type,
    title: item.title || item.name || null,
    poster_path: item.poster_path || null,
    vote_average: item.vote_average || null,
    genre_ids: item.genre_ids || [],
    rating,
  };
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("ratings")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.error("Failed to load ratings:", error);
          setItems([]);
        } else {
          setItems((data || []).map(rowToItem));
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorited = (id, mediaType) =>
    items.some((item) => item.id === id && item.media_type === mediaType);

  const getRating = (id, mediaType) =>
    items.find((item) => item.id === id && item.media_type === mediaType)?.rating || 0;

  const setRating = async (item, rating) => {
    if (!user) return;

    const exists = isFavorited(item.id, item.media_type);
    const previousItems = items;

    if (rating === 0) {
      // Clearing a rating removes the row entirely
      setItems((prev) =>
        prev.filter((i) => !(i.id === item.id && i.media_type === item.media_type))
      );

      const { error } = await supabase
        .from("ratings")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", item.id)
        .eq("media_type", item.media_type);

      if (error) {
        console.error("Failed to remove rating:", error);
        setItems(previousItems);
      }
      return;
    }

    if (exists) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id && i.media_type === item.media_type ? { ...i, rating } : i
        )
      );
    } else {
      setItems((prev) => [...prev, { ...item, rating, addedAt: Date.now() }]);
    }

    const { error } = await supabase
      .from("ratings")
      .upsert(itemToRow(item, user.id, rating), { onConflict: "user_id,tmdb_id,media_type" });

    if (error) {
      console.error("Failed to save rating:", error);
      setItems(previousItems);
    }
  };

  const toggleFavorite = (item) => {
    if (isFavorited(item.id, item.media_type)) {
      setRating(item, 0);
    } else {
      setRating(item, 1);
    }
  };

  const clearFavorites = async () => {
    if (!user) return;

    const previousItems = items;
    setItems([]);

    const { error } = await supabase.from("ratings").delete().eq("user_id", user.id);

    if (error) {
      console.error("Failed to clear ratings:", error);
      setItems(previousItems);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ items, loading, isFavorited, getRating, setRating, toggleFavorite, clearFavorites }}
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