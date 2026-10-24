
import { useEffect, useState } from "react";

function AnimatedNumber({
  value,
  decimals = 0,
  duration = 900,
  suffix = "",
}) {
  const target = Number(value);
  const [displayValue, setDisplayValue] = useState(
    Number.isFinite(target) ? target : 0,
  );

  useEffect(() => {
    if (!Number.isFinite(target)) return;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (mediaQuery.matches || duration <= 0) {
      setDisplayValue(target);
      return;
    }

    let frameId;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(target * easedProgress);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  if (!Number.isFinite(target)) {
    return <>{String(value ?? "")}</>;
  }

  return (
    <>
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

export default AnimatedNumber;
