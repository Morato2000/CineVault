import { IoContractOutline, IoExpandOutline } from "react-icons/io5";
import SidebarLink from "./SidebarLink";
import brandLogo from "../../assets/icons/BRAND.svg";
import {
  mainNavigation,
  secondaryNavigation,
} from "../../data/navigation";
import { Link } from "react-router-dom";

function Sidebar({ collapsed, onToggle }) {
  const [settingsItem, ...restSecondary] = secondaryNavigation;

  const ToggleButton = (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/70 text-purple-400 hover:bg-white/10"
    >
      {collapsed ? (
        <IoExpandOutline className="h-4 w-4" />
      ) : (
        <IoContractOutline className="h-4 w-4" />
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
      <img src={brandLogo} alt="CineVault" className="h-10 w-auto max-w-none" />
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
          collapsed
        />
      ))}
      <div className="flex justify-center pt-2">{ToggleButton}</div>
    </>
  ) : (
    <>
      {/* Settings + toggle, same row */}
      <div className="flex w-full items-center justify-between">
        <SidebarLink
          label={settingsItem.label}
          path={settingsItem.path}
          icon={settingsItem.icon}
          variant="secondary"
          collapsed={false}
        />
        {ToggleButton}
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