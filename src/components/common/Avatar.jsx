
import { useState } from "react";
import { IoPersonOutline } from "react-icons/io5";

function Avatar({ src, name, className = "h-10 w-10" }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        onError={() => setImageFailed(true)}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  if (name?.trim()) {
    return (
      <div
        role="img"
        aria-label={`${name}'s avatar`}
        className={`${className} flex items-center justify-center rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] font-bold text-white`}
      >
        {name.trim().charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label="Default avatar"
      className={`${className} flex items-center justify-center rounded-full bg-white/10 text-gray-400`}
    >
      <IoPersonOutline className="h-1/2 w-1/2" />
    </div>
  );
}

export default Avatar;
