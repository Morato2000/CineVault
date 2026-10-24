import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/common/ScrollToTop";
import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Watchlist from "../pages/Watchlist";
import Stats from "../pages/Stats";
import Settings from "../pages/Settings";
import Help from "../pages/Help";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetLinkSent from "../pages/ResetLinkSent.jsx";
import ResetPassword from "../pages/ResetPassword";
import SearchResults from "../pages/SearchResults";
import Details from "../pages/Details";
import Cast from "../pages/Cast";
import FullInfo from "../pages/FullInfo";
import RootRedirect from "../pages/RootRedirect";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import NotFound from "../pages/NotFound";
import Notifications from "../pages/Notifications";
import WrappedLanding from "../pages/WrappedLanding";
import MonthlyWrapped from "../pages/MonthlyWrapped.jsx";
import YearlyWrapped from "../pages/YearlyWrapped";
export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main Application */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/explore" element={<Explore />} />

          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<Help />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/:mediaType/:id" element={<Details />} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="/:mediaType/:id/cast" element={<Cast />} />
          <Route path="/:mediaType/:id/info" element={<FullInfo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/wrapped"
            element={
              <ProtectedRoute>
                <WrappedLanding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wrapped/monthly"
            element={
              <ProtectedRoute>
                <MonthlyWrapped />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wrapped/yearly"
            element={
              <ProtectedRoute>
                <YearlyWrapped />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/sent" element={<ResetLinkSent />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
