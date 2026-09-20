import { createContext, useContext, useEffect, useState } from "react";

const PreferencesContext = createContext(null);
const STORAGE_KEY = "cinevault_preferences";

const DEFAULT_PREFERENCES = {
  theme: "dark", // "system" | "light" | "dark" — only "dark" is actually implemented
  defaultLandingPage: "Home", // "Home" | "Explore" | "My Watchlist" | "Stats"
  defaultView: "grid", // "grid" | "list"
  defaultSort: "Recently Added", // "Recently Added" | "Highest Rated" | "A-Z"
  notifications: {
    newReleases: true,
    upcomingMovies: true,
    personalizedDiscoveries: false,
  },
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
        : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // localStorage unavailable — fail silently
    }
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const resetPreferences = () => setPreferences(DEFAULT_PREFERENCES);

  return (
    <PreferencesContext.Provider
      value={{ preferences, updatePreference, updateNotification, resetPreferences }}
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