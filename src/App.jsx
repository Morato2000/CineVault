import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ProfileProvider } from "./context/ProfileContext";
import { PreferencesProvider } from "./context/PreferencesContext";

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  return (
    <AuthProvider>
      <ProfileProvider>
        <PreferencesProvider>
          <WatchlistProvider>
            <FavoritesProvider>
              <AppRoutes />
            </FavoritesProvider>
          </WatchlistProvider>
        </PreferencesProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
