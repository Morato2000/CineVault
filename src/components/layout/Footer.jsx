import { NavLink } from "react-router-dom";
import { FaDiscord, FaXTwitter, FaInstagram } from "react-icons/fa6";
import brandLogo from "../../assets/icons/BRAND.svg";
import { mainNavigation } from "../../data/navigation";

const supportLinks = [
  { label: "Help Center", path: "/help" },
  { label: "Donate", path: "/donate" },
  { label: "Contact us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy" },
];

const socialLinks = [
  {
    label: "Discord",
    href: "#",
    icon: FaDiscord,
    className: "bg-[#5865F2] text-white",
  },
  {
    label: "X",
    href: "#",
    icon: FaXTwitter,
    className: "bg-white/10 text-white",
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
    className:
      "bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white",
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
          <h3 className="text-sm font-bold text-purple-400">Connect</h3>
          <div className="mt-4 flex gap-3">
            {socialLinks.map(({ label, href, icon: Icon, className }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform hover:scale-105 ${className}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-10 py-5 text-center text-xs text-gray-500">
        © 2026 CineVault. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
