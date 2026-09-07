import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { FavoritesProvider } from "./context/FavoritesContext"

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  return (
    <AuthProvider>
      <WatchlistProvider>
        <FavoritesProvider>
        <AppRoutes />
        </FavoritesProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
