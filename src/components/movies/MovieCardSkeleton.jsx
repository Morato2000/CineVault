function MovieCardSkeleton({ size = "md" }) {
  const dims = size === "sm" ? "h-[270px] w-[180px]" : "h-[360px] w-[240px]";

  return (
    <div
      className={`${dims} shrink-0 overflow-hidden rounded-2xl bg-[#111827]`}
    >
      <div className="h-full w-full animate-pulse">
        {/* Poster area */}
        <div className="h-full w-full bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default MovieCardSkeleton;
