function MovieCardSkeleton() {
  return (
    <div className="h-[360px] w-[240px] shrink-0 animate-pulse overflow-hidden rounded-[22px] bg-[#111827]">
      <div className="flex h-full flex-col justify-end p-5">
        <div className="h-5 w-3/4 rounded bg-white/10" />
        <div className="mt-4 h-4 w-1/3 rounded bg-white/10" />

        <div className="mt-7 flex items-center justify-between">
          <div className="h-8 w-20 rounded-xl bg-white/10" />
          <div className="h-8 w-16 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default MovieCardSkeleton;