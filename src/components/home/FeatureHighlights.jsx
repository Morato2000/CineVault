import { FiHeart, FiBarChart2, FiBell } from "react-icons/fi";

const features = [
  {
    icon: FiHeart,
    title: "Save Your Watchlist",
    description: "Add movies, shows and anime you want to watch later.",
    iconClass: "bg-red-500/10 text-red-400",
  },
  {
    icon: FiBarChart2,
    title: "Track Your Collection",
    description: "Track your collection progress.",
    iconClass: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: FiBell,
    title: "Stay Notified",
    description: "Receive updates for show releases and updates.",
    iconClass: "bg-amber-500/10 text-amber-400",
  },
];

function FeatureHighlights() {
  return (
<div className="m-8 grid grid-cols-1 divide-y divide-indigo-500/30 rounded-2xl border border-indigo-500/30 bg-[#0B0D19] md:grid-cols-3 md:divide-x md:divide-y-0">
      {features.map(({ icon: Icon, title, description, iconClass }) => (
        <div key={title} className="flex items-center gap-8 p-12">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeatureHighlights;