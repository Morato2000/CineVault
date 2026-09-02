function MovieCardSkeleton({ size = "md" }) {
  const dims = size === "sm" ? "h-[270px] w-[180px]" : "h-[360px] w-[240px]";

  return (
    <div className={`${dims} shrink-0 animate-pulse overflow-hidden rounded-2xl bg-[#111827]`}>
      <div className="flex h-full flex-col justify-end p-4">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="mt-3 h-3 w-1/3 rounded bg-white/10" />
        <div className="mt-5 flex items-center justify-between">
          <div className="h-6 w-16 rounded-xl bg-white/10" />
          <div className="h-6 w-12 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default MovieCardSkeleton;