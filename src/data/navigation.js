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
  { label: "My Watchlist", path: "/watchlist", icon: IoBookmark },
  { label: "Stats", path: "/stats", icon: IoStatsChart },
];

export const secondaryNavigation = [
  { label: "Settings", path: "/settings", icon: IoSettingsSharp },
  { label: "Help & Support", path: "/help", icon: IoHelpCircleSharp },
];
