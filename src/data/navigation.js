import {
  IoHomeSharp,
  IoCompassSharp,
  IoBookmark,
  IoStatsChart,
  IoSettingsSharp,
  IoHelpCircleSharp,
} from "react-icons/io5";

export const mainNavigation = [
  { label: "Home", path: "/", icon: IoHomeSharp },
  { label: "Explore", path: "/explore", icon: IoCompassSharp },
  {
    label: "My Watchlist",
    path: "/watchlist",
    icon: IoBookmark,
    requiresAuth: true,
  },
  {
    label: "Stats",
    path: "/stats",
    icon: IoStatsChart,
    requiresAuth: true,
  },
];

export const secondaryNavigation = [
  {
    label: "Settings",
    path: "/settings",
    icon: IoSettingsSharp,
    requiresAuth: true,
  },
  { label: "Help & Support", path: "/help", icon: IoHelpCircleSharp },
];
