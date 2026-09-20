import { Navigate } from "react-router-dom";
import Home from "./Home";
import { usePreferences } from "../context/PreferencesContext";

const PATHS = { Home: "/", Explore: "/explore", "My Watchlist": "/watchlist", Stats: "/stats" };

function RootRedirect() {
  const { preferences } = usePreferences();
  const target = PATHS[preferences.defaultLandingPage] || "/";

  if (target !== "/") return <Navigate to={target} replace />;
  return <Home />;
}

export default RootRedirect;