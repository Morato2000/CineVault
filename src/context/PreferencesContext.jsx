import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "./AuthContext";

const PreferencesContext = createContext(null);

const DEFAULT_PREFERENCES = {
  theme: "dark",
  defaultLandingPage: "Home",
  defaultView: "grid",
  defaultSort: "Recently Added",
  emailNotifications: false,
  notifications: {
    newReleases: true,
    upcomingMovies: true,
    personalizedDiscoveries: false,
  },
};

function rowToPreferences(row) {
  return {
    theme: row.theme,
    emailNotifications: row.email_notifications ?? false,
    defaultLandingPage: row.default_landing_page,
    defaultView: row.default_view,
    defaultSort: row.default_sort,
    notifications: {
      newReleases: row.notify_new_releases,
      upcomingMovies: row.notify_upcoming_movies,
      personalizedDiscoveries: row.notify_personalized_discoveries,
    },
  };
}

function preferencesToRow(prefs, userId) {
  return {
    user_id: userId,
    theme: prefs.theme,
    email_notifications: prefs.emailNotifications ?? false,
    default_landing_page: prefs.defaultLandingPage,
    default_view: prefs.defaultView,
    default_sort: prefs.defaultSort,
    notify_new_releases: prefs.notifications.newReleases,
    notify_upcoming_movies: prefs.notifications.upcomingMovies,
    notify_personalized_discoveries:
      prefs.notifications.personalizedDiscoveries,
  };
}

export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from("preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.error("Failed to load preferences:", error);
          setPreferences(DEFAULT_PREFERENCES);
        } else if (!data) {
          const { error: insertError } = await supabase
            .from("preferences")
            .insert(preferencesToRow(DEFAULT_PREFERENCES, user.id));

          if (insertError) {
            console.error("Failed to create preferences row:", insertError);
          }

          setPreferences(DEFAULT_PREFERENCES);
        } else {
          setPreferences(rowToPreferences(data));
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const updatePreference = async (key, value) => {
    if (!user) return;

    const previous = preferences;
    const next = {
      ...preferences,
      [key]: value,
    };

    setPreferences(next);

    const { error } = await supabase
      .from("preferences")
      .upsert(preferencesToRow(next, user.id), { onConflict: "user_id" });

    if (error) {
      console.error("Failed to update preference:", error);
      setPreferences(previous);
    }
  };

  const updateNotification = async (key, value) => {
    if (!user) return;

    const previous = preferences;
    const next = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    };

    setPreferences(next);

    const { error } = await supabase
      .from("preferences")
      .upsert(preferencesToRow(next, user.id), { onConflict: "user_id" });

    if (error) {
      console.error("Failed to update notification preference:", error);
      setPreferences(previous);
    }
  };

  const resetPreferences = async () => {
    if (!user) return;

    const previous = preferences;

    setPreferences(DEFAULT_PREFERENCES);

    const { error } = await supabase
      .from("preferences")
      .upsert(preferencesToRow(DEFAULT_PREFERENCES, user.id), {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Failed to reset preferences:", error);
      setPreferences(previous);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        updatePreference,
        updateNotification,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }

  return context;
}
