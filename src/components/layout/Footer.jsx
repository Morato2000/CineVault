import { NavLink } from "react-router-dom";
import { FaDiscord, FaXTwitter, FaInstagram } from "react-icons/fa6";
import brandLogo from "../../assets/icons/BRAND.svg";
import { mainNavigation } from "../../data/navigation";

const supportLinks = [
  { label: "Help Center", path: "/help" },
  { label: "Contact us", path: "/message-us" },
  { label: "Privacy Policy", path: "/privacy-policy" },
];

const socialLinks = [
  {
    label: "Discord",
    icon: FaDiscord,
    className: "bg-[#5865F2]/40 text-white/60",
  },
  {
    label: "X",
    icon: FaXTwitter,
    className: "bg-white/10 text-white/60",
  },
  {
    label: "Instagram",
    icon: FaInstagram,
    className:
      "bg-gradient-to-br from-yellow-400/40 via-pink-500/40 to-purple-600/40 text-white/60",
  },
];

function Footer() {
  return (
    <footer className="mt-16 border-t border-indigo-500/30">
      <div className="grid grid-cols-1 gap-10 px-10 py-12 md:grid-cols-4 md:divide-x md:divide-indigo-500/30">
        {/* Brand */}
        <div className="md:pr-8">
          <img src={brandLogo} alt="CineVault" className="h-auto w-40" />
          <p className="mt-3 text-sm text-gray-400">
            Your personal vault for all the movies, series and anime you want to
            watch.
          </p>
        </div>

        {/* Navigations */}
        <div className="md:px-8">
          <h3 className="text-sm font-bold text-purple-400">Navigations</h3>
          <ul className="mt-4 space-y-3">
            {mainNavigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="md:px-8">
          <h3 className="text-sm font-bold text-purple-400">Support</h3>
          <ul className="mt-4 space-y-3">
            {supportLinks.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-gray-400 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div className="md:pl-8">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-purple-400">Connect</h3>
            <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2 py-0.5 text-[10px] font-medium text-purple-300">
              Coming Soon
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            {socialLinks.map(({ label, icon: Icon, className }) => (
              <div
                key={label}
                aria-label={`${label} — coming soon`}
                title={`${label} — coming soon`}
                className={`flex h-10 w-10 cursor-default items-center justify-center rounded-xl ${className}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-10 py-5 text-center text-xs text-gray-500">
        © 2026 CineVault. All rights reserved. A product of Odderatic Studio.
      </div>
    </footer>
  );
}

export default Footer;
