import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
const SLIDE_DURATION = 6000;
function WrappedStory({ slides, onClose }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const [progressStarted, setProgressStarted] = useState(false);
  const close = onClose || (() => navigate("/wrapped"));
  const isLast = index >= slides.length - 1;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const next = () => {
    if (index < slides.length - 1) {
      setIndex((i) => i + 1);
    } else {
      close();
    }
  };

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  useEffect(() => {
    if (isLast || reducedMotion || slides.length === 0) return;

    const timer = setTimeout(() => {
      setIndex((current) => current + 1);
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [index, isLast, reducedMotion, slides.length]);

  useEffect(() => {
    setProgressStarted(false);

    let secondFrame;

    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setProgressStarted(true);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);

      if (secondFrame !== undefined) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [index]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, slides.length, close]);

  const Slide = slides[index] ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={close}
    >
      <div
        className="relative flex h-full w-full max-w-md flex-col overflow-hidden sm:h-[90vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
          
{slides.map((_, i) => (
  <div
    key={i}
    className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
  >
    <div
      className={`h-full rounded-full bg-white ${
        i < index
          ? "w-full transition-none"
          : i === index
            ? reducedMotion
              ? "w-full transition-none"
              : progressStarted
                ? "w-full transition-[width] duration-[6000ms] ease-linear"
                : "w-0 transition-none"
            : "w-0 transition-none"
      }`}
    />
  </div>
))}

        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-7 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
        >
          <IoClose className="h-5 w-5" />
        </button>

        <div className="relative flex-1">{Slide}</div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous"
          className="absolute inset-y-0 left-0 z-10 w-1/3 focus:outline-none"
        />
        <button
          type="button"
          onClick={next}
          aria-label="Next"
          className="absolute inset-y-0 right-0 z-10 w-2/3 focus:outline-none"
        />
      </div>
    </div>
  );
}

export default WrappedStory;
