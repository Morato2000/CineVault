
import { NavLink, useNavigate } from "react-router-dom";

import { IoLockClosedOutline } from "react-icons/io5";

function SidebarLink({
  label,
  path,
  icon: Icon,
  variant = "primary",
  collapsed = false,
  locked = false,
}) {
  const navigate = useNavigate();

  if (locked) {
    if (variant === "secondary") {
      return (
        <button
          type="button"
          onClick={() => navigate("/login")}
          title={`${label} — Login required`}
          className={`flex items-center gap-3 rounded-xl py-2 text-base font-semibold text-gray-500 opacity-60 ${
            collapsed ? "justify-center px-0" : "w-full px-4"
          }`}
        >
          <Icon className="h-5 w-5 shrink-0" />

          {!collapsed && label}

          {!collapsed && (
            <IoLockClosedOutline className="ml-auto h-4 w-4" />
          )}
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => navigate("/login")}
        title={`${label} — Login required`}
        className={`flex h-14 items-center rounded-3xl border border-white/10 text-lg font-semibold text-gray-500 opacity-50 ${
          collapsed
            ? "w-14 justify-center"
            : "w-full gap-3 px-6"
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />

        {!collapsed && label}

        {!collapsed && (
          <IoLockClosedOutline className="ml-auto h-4 w-4" />
        )}
      </button>
    );
  }

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
          collapsed
            ? "w-14 justify-center"
            : "w-full gap-3 px-6"
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
