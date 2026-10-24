import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const WatchlistContext = createContext(null);

function rowToItem(row) {
  return {
    id: row.tmdb_id,
    media_type: row.media_type,
    title: row.title,
    poster_path: row.poster_path,
    release_date: row.release_date,
    first_air_date: row.first_air_date,
    vote_average: row.vote_average,
    status: row.status,
    last_air_date: row.last_air_date,
    genre_ids: row.genre_ids || [],
    original_language: row.original_language,
    origin_country: row.origin_country || [],
    addedAt: new Date(row.added_at).getTime(),
  };
}

function itemToRow(item, userId) {
  return {
    added_at: item.addedAt
      ? new Date(item.addedAt).toISOString()
      : new Date().toISOString(),
    user_id: userId,
    tmdb_id: item.id,
    media_type: item.media_type,
    title: item.title || item.name || null,
    poster_path: item.poster_path || null,
    release_date: item.release_date || null,
    first_air_date: item.first_air_date || null,
    vote_average: item.vote_average || null,
    status: item.status || null,
    last_air_date: item.last_air_date || null,
    genre_ids: item.genre_ids || [],
    original_language: item.original_language || null,
    origin_country: item.origin_country || [],
  };
}

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!userId) {
    setItems([]);
    setLoading(false);
    return;
  }

  let cancelled = false;
  setLoading(true);

  supabase
    .from("watchlist_items")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })
    .then(({ data, error }) => {
      if (cancelled) return;

      if (error) {
        console.error("Failed to load watchlist:", error);
        setItems([]);
      } else {
        setItems((data || []).map(rowToItem));
      }

      setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [userId]);

  const isInWatchlist = (id, mediaType) =>
    items.some((item) => item.id === id && item.media_type === mediaType);

  const addToWatchlist = async (item) => {
    if (!user) return;
    if (isInWatchlist(item.id, item.media_type)) return;

    const optimisticItem = {
      ...item,
      addedAt: Date.now(),
    };

    setItems((prev) => [optimisticItem, ...prev]);

    const { error } = await supabase
      .from("watchlist_items")
      .insert(itemToRow(item, user.id));

    if (error) {
      console.error("Failed to add to watchlist:", error);

      setItems((prev) =>
        prev.filter(
          (i) => !(i.id === item.id && i.media_type === item.media_type),
        ),
      );
    }
  };

  const removeFromWatchlist = async (id, mediaType) => {
    if (!user) return;

    const previousItems = items;

    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.media_type === mediaType)),
    );

    const { error } = await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("tmdb_id", id)
      .eq("media_type", mediaType);

    if (error) {
      console.error("Failed to remove from watchlist:", error);

      setItems(previousItems);
    }
  };

  const toggleWatchlist = (item) => {
    if (isInWatchlist(item.id, item.media_type)) {
      removeFromWatchlist(item.id, item.media_type);
    } else {
      addToWatchlist(item);
    }
  };

  const clearWatchlist = async () => {
    if (!user) return;

    const previousItems = items;

    setItems([]);

    const { error } = await supabase
      .from("watchlist_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to clear watchlist:", error);

      setItems(previousItems);
    }
  };

  const importWatchlist = async (importedItems) => {
    if (!user || !Array.isArray(importedItems)) return;

    const newItems = importedItems.filter(
      (item) => !isInWatchlist(item.id, item.media_type),
    );

    if (newItems.length === 0) return;

    const optimisticItems = newItems.map((item) => ({
      ...item,
      addedAt: item.addedAt || Date.now(),
    }));

    setItems((prev) => [...optimisticItems, ...prev]);

    const rows = optimisticItems.map((item) => ({
      ...itemToRow(item, user.id),
      added_at: new Date(item.addedAt).toISOString(),
    }));

    const { error } = await supabase.from("watchlist_items").insert(rows);

    if (error) {
      console.error("Failed to import watchlist:", error);

      setItems((prev) =>
        prev.filter(
          (item) =>
            !newItems.some(
              (newItem) =>
                newItem.id === item.id &&
                newItem.media_type === item.media_type,
            ),
        ),
      );
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        items,
        loading,
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
