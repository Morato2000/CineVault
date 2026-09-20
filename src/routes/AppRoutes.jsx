import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/common/ScrollToTop";

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
import SearchResults from "../pages/SearchResults";
import Details from "../pages/Details";
import Cast from "../pages/Cast";
import FullInfo from "../pages/FullInfo";
import RootRedirect from "../pages/RootRedirect";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import NotFound from "../pages/NotFound";
export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main Application */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/:mediaType/:id" element={<Details />} />
          <Route path="/:mediaType/:id/cast" element={<Cast />} />
          <Route path="/:mediaType/:id/info" element={<FullInfo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Route>

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/reset-password/sent" element={<ResetLinkSent />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
