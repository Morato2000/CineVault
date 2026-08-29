import { NavLink } from "react-router-dom";

function SidebarLink({ label, path, icon: Icon, variant = "primary", collapsed = false }) {
if (variant === "secondary") {
  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl py-2 text-base font-semibold transition-colors ${
          collapsed ? "justify-center px-0" : "w-full px-4"
        } ${
          isActive
            ? "bg-white/10 text-white"
            : "text-gray-200 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-purple-400" />
      {!collapsed && label}
    </NavLink>
  );
}

  return (
  <NavLink
    to={path}
    title={collapsed ? label : undefined}
    className={({ isActive }) =>
      `flex h-14 items-center rounded-3xl text-lg font-semibold transition ${
        collapsed ? "w-14 justify-center" : "w-full gap-3 px-6"
      } ${
        isActive
          ? "bg-gradient-to-b from-[#A855F7] to-[#3B82F6]"
          : "border border-[#477DF7]/70 hover:bg-white/10"
      }`
    }
  >
    <Icon className="h-5 w-5 shrink-0" />
    {!collapsed && label}
  </NavLink>
);
}

export default SidebarLink;