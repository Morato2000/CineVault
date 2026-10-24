
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Toast({ message, show, onClose, duration = 2000 }) {
  const onCloseRef = useRef(onClose);

  // Always use the latest callback without restarting the timer.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {show && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto rounded-full border border-indigo-500/30 bg-[#0B0F1A] px-5 py-3 text-sm font-medium text-white shadow-xl shadow-black/40"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
