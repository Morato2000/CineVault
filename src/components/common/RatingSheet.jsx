
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoHeart } from "react-icons/io5";
import { IoClose, IoRemove, IoAdd } from "react-icons/io5";

const clampRating = (value) =>
  Math.max(0.5, Math.min(10, Math.round(value * 2) / 2));

function getRatingLabel(value) {
  if (value >= 9.5) return "Absolutely loved it";
  if (value >= 8) return "Excellent";
  if (value >= 6.5) return "Really good";
  if (value >= 5) return "Pretty good";
  if (value >= 3.5) return "It was okay";
  if (value >= 2) return "Not for me";
  return "Disappointing";
}

function RatingSheet({ open, initialValue = 0, onSave, onRemove, onClose }) {
  const [value, setValue] = useState(initialValue > 0 ? initialValue : 5);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const scrubberRef = useRef(null);
  const startY = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue > 0 ? initialValue : 5);
      setSaving(false);
    }
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving, onClose]);

  const updateFromPointer = (event) => {
    const bounds = scrubberRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = Math.max(
      0,
      Math.min(1, (event.clientX - bounds.left) / bounds.width)
    );

    setValue(clampRating(position * 10));
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    scrubberRef.current?.setPointerCapture(event.pointerId);
    setDragging(true);
    updateFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    updateFromPointer(event);
  };

  const handlePointerUp = (event) => {
    if (!dragging) return;
    updateFromPointer(event);
    setDragging(false);
  };

  const adjust = (amount) => {
    setValue((current) =>
      Math.max(0.5, Math.min(10, Math.round((current + amount) * 2) / 2))
    );
  };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    onSave(value);
  };

  const handleRemove = () => {
    if (saving) return;
    setSaving(true);
    onRemove();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-sheet-title"
            className="w-full max-w-lg rounded-t-3xl border border-white/10 bg-[#15151f] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 text-white shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <button
              type="button"
              aria-label="Close rating sheet"
              disabled={saving}
              onClick={onClose}
              className="mx-auto mb-5 block h-1.5 w-12 rounded-full bg-white/25"
            />

            <div className="mb-7 flex items-center justify-between">
              <div>
                <h2 id="rating-sheet-title" className="text-lg font-bold">
                  Your rating
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  How much did you enjoy it?
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close"
                className="rounded-full bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="mb-7 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-extrabold tabular-nums text-white">
                  {value.toFixed(1)}
                </span>
                <span className="mt-4 text-lg text-gray-500">/10</span>
              </div>

              <p className="mt-2 text-sm font-medium text-red-400">
                {getRatingLabel(value)}
              </p>
            </div>

            <div className="mb-7">
              <div
                ref={scrubberRef}
                role="slider"
                aria-label="Your rating"
                aria-valuemin={0.5}
                aria-valuemax={10}
                aria-valuenow={value}
                aria-valuetext={`${value} out of 10`}
                tabIndex={0}
                className="flex touch-none select-none items-center justify-between gap-1 rounded-xl py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => setDragging(false)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                    event.preventDefault();
                    adjust(0.5);
                  }
                  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                    event.preventDefault();
                    adjust(-0.5);
                  }
                  if (event.key === "Home") setValue(0.5);
                  if (event.key === "End") setValue(10);
                }}
              >
                {Array.from({ length: 10 }, (_, index) => {
                  const fill = Math.max(
                    0,
                    Math.min(1, value - index)
                  );

                  return (
                    <span
                      key={index}
                      className="relative flex-1"
                      aria-hidden="true"
                    >
                      <IoHeart className="h-7 w-full text-gray-700" />
                      <span
                        className="absolute inset-y-0 left-0 overflow-hidden"
                        style={{ width: `${fill * 100}%` }}
                      >
                        <IoHeart className="h-7 w-7 max-w-none text-red-500" />
                      </span>
                    </span>
                  );
                })}
              </div>

              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0.5</span>
                <span>10</span>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6">
                <button
                  type="button"
                  aria-label="Decrease rating by 0.5"
                  disabled={value <= 0.5 || saving}
                  onClick={() => adjust(-0.5)}
                  className="rounded-full border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10 disabled:opacity-30"
                >
                  <IoRemove size={20} />
                </button>

                <span className="min-w-16 text-center text-sm text-gray-400">
                  {value.toFixed(1)} / 10
                </span>

                <button
                  type="button"
                  aria-label="Increase rating by 0.5"
                  disabled={value >= 10 || saving}
                  onClick={() => adjust(0.5)}
                  className="rounded-full border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10 disabled:opacity-30"
                >
                  <IoAdd size={20} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {initialValue > 0 && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleRemove}
                  className="rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  Remove
                </button>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save rating"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RatingSheet;
