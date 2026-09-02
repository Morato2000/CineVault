import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  return (
    <AuthProvider>
      <WatchlistProvider>
        <AppRoutes />
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
