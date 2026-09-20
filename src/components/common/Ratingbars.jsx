import { useState } from "react";

function RatingBars({ rating = 0, onRate = null, size = "md" }) {
  const [hoverRating, setHoverRating] = useState(0);
  const interactive = typeof onRate === "function";
  const displayRating = hoverRating || rating;

  const dims = size === "sm" ? "h-1.5 w-3.5" : "h-2 w-6";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";

  return (
    <div className={`flex ${gap}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = displayRating >= n;

        const bar = (
          <span
            className={`${dims} rounded-full transition-colors ${
              filled ? "bg-amber-400" : "bg-white/15"
            }`}
          />
        );

        if (!interactive) {
          return <span key={n}>{bar}</span>;
        }

        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => onRate(rating === n ? 0 : n)}
            aria-label={`Rate ${n} out of 5`}
          >
            {bar}
          </button>
        );
      })}
    </div>
  );
}

export default RatingBars;