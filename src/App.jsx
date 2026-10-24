
import { MotionConfig } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProfileProvider } from "./context/ProfileContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { NotificationsProvider } from "./context/NotificationsContext";

function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D17]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return children;
}

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <AuthGate>
          <ProfileProvider>
            <PreferencesProvider>
              <WatchlistProvider>
                <FavoritesProvider>
                  <NotificationsProvider>
                    <AppRoutes />
                  </NotificationsProvider>
                </FavoritesProvider>
              </WatchlistProvider>
            </PreferencesProvider>
          </ProfileProvider>
        </AuthGate>
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
