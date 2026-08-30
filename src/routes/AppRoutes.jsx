import { Routes, Route } from "react-router-dom";

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
export default function AppRoutes() {
  return (
    <Routes>
      {/* Main Application */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ForgotPassword />} />
     <Route path="/reset-password/sent" element={<ResetLinkSent />} />
    </Routes>
  );
}
