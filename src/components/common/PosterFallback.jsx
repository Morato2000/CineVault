function PosterFallback({ title, className = "" }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#2A1B4D] to-[#111827] p-3 text-center ${className}`}
    >
      <span className="line-clamp-4 text-xs font-bold leading-snug text-white/70">
        {title}
      </span>
    </div>
  );
}

export default PosterFallback;