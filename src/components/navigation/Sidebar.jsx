import { IoContractOutline, IoExpandOutline } from "react-icons/io5";

import SidebarLink from "./SidebarLink";

import brandLogo from "../../assets/icons/BRAND.svg";

import { mainNavigation, secondaryNavigation } from "../../data/navigation";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Sidebar({ collapsed, onToggle }) {
  const [settingsItem, ...restSecondary] = secondaryNavigation;

  const { isLoggedIn } = useAuth();

  const ToggleButton = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/60 bg-indigo-500/10 text-purple-300 shadow-sm shadow-indigo-500/10 transition-all duration-200 hover:border-purple-400 hover:bg-indigo-500/20 hover:text-white hover:shadow-md hover:shadow-purple-500/20 active:scale-95"
    >
      {collapsed ? (
        <IoExpandOutline className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      ) : (
        <IoContractOutline className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      )}
    </button>
  );

  return (
    <aside
      className={`fixed left-0 top-0 flex h-screen flex-col border-r border-indigo-500/40 bg-[#080D17] py-6 transition-all duration-300 ${
        collapsed ? "w-[104px] px-4" : "w-[320px] px-6"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="mb-6 flex flex-col items-center">
        {collapsed ? (
          <div className="h-10 w-[46px] overflow-hidden">
            <img
              src={brandLogo}
              alt="CineVault"
              className="h-10 w-auto max-w-none"
            />
          </div>
        ) : (
          <>
            <img src={brandLogo} alt="CineVault" className="h-auto w-44" />

            <p className="mt-1 text-xs tracking-widest text-gray-400">
              MOVIES • ANIME • MEMORIES
            </p>
          </>
        )}
      </Link>

      <div className="border-t border-indigo-500/30" />

      {/* Main Navigation */}
      <nav className="mt-6 flex flex-col items-center space-y-4">
        {mainNavigation.map((item) => (
          <SidebarLink
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
            collapsed={collapsed}
            locked={
              !isLoggedIn &&
              (item.path === "/watchlist" || item.path === "/stats")
            }
          />
        ))}
      </nav>

      {/* Secondary Navigation */}
      <nav
        className={`mt-auto flex flex-col items-center space-y-2 pb-2 ${
          collapsed ? "border-t border-indigo-500/30 pt-4" : ""
        }`}
      >
        {collapsed ? (
          <>
            {secondaryNavigation.map((item) => (
              <SidebarLink
                key={item.path}
                label={item.label}
                path={item.path}
                icon={item.icon}
                variant="secondary"
                collapsed={collapsed}
                locked={!isLoggedIn && item.label === "Settings"}
              />
            ))}

            <div className="flex flex-col items-center gap-1 pt-2">
              {ToggleButton}
              <span className="text-[10px] font-medium tracking-wide text-gray-500">
                Expand
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Settings + toggle, same row */}
            <div className="group relative">
              {ToggleButton}
              <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-indigo-500/30 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-gray-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Collapse sidebar
              </span>
            </div>

            {restSecondary.map((item) => (
              <SidebarLink
                key={item.path}
                label={item.label}
                path={item.path}
                icon={item.icon}
                variant="secondary"
                collapsed={false}
              />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
