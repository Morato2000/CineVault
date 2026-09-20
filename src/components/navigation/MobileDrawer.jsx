import { IoClose } from "react-icons/io5";
import SidebarLink from "./SidebarLink";
import brandLogo from "../../assets/icons/BRAND.svg";
import { mainNavigation, secondaryNavigation } from "../../data/navigation";

function MobileDrawer({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div className="relative flex h-full flex-col bg-[#080D17] px-4 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-500"
          >
            <IoClose className="h-5 w-5" />
          </button>

          <img src={brandLogo} alt="CineVault" className="h-8 w-auto" />

          <div className="w-9" />
        </div>

        <div className="mt-8 rounded-2xl border border-indigo-500/30 p-6">
          <nav className="space-y-4">
            {mainNavigation.map((item) => (
              <div key={item.path} onClick={onClose}>
                <SidebarLink label={item.label} path={item.path} icon={item.icon} />
              </div>
            ))}
          </nav>

          <nav className="mt-6 space-y-2 border-t border-indigo-500/30 pt-4">
            {secondaryNavigation.map((item) => (
              <div key={item.path} onClick={onClose}>
                <SidebarLink
                  label={item.label}
                  path={item.path}
                  icon={item.icon}
                  variant="secondary"
                />
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;