import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

function App() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
