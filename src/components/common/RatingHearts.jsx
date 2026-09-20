import { useState } from "react";
import { IoHeart } from "react-icons/io5";

function HeartDisplay({ value, size }) {
  const dims = size === "sm" ? "h-3 w-3" : "h-5 w-5";

  return (
    <span className="relative inline-block">
      <IoHeart className={`${dims} text-gray-300`} />
      {value > 0 && (
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${value * 100}%` }}>
          <IoHeart className={`${dims} text-red-500`} />
        </span>
      )}
    </span>
  );
}

function RatingHearts({ rating = 0, onRate = null, size = "md" }) {
  const [hoverRating, setHoverRating] = useState(0);
  const interactive = typeof onRate === "function";
  const displayRating = hoverRating || rating;

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const fill = Math.max(0, Math.min(1, displayRating - (n - 1)));

        if (!interactive) {
          return <HeartDisplay key={n} value={fill} size={size} />;
        }

        return (
          <span key={n} className="relative inline-block">
            <HeartDisplay value={fill} size={size} />
            <span className="absolute inset-0 flex">
              <button
                type="button"
                className="h-full w-1/2"
                onMouseEnter={() => setHoverRating(n - 0.5)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onRate(rating === n - 0.5 ? 0 : n - 0.5)}
                aria-label={`Rate ${n - 0.5} out of 10`}
              />
              <button
                type="button"
                className="h-full w-1/2"
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onRate(rating === n ? 0 : n)}
                aria-label={`Rate ${n} out of 10`}
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default RatingHearts;