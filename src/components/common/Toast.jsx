import { useEffect } from "react";

function Toast({ message, show, onClose, duration = 2000 }) {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-indigo-500/30 bg-[#0B0F1A] px-5 py-3 text-sm font-medium text-white shadow-xl shadow-black/40">
      {message}
    </div>
  );
}

export default Toast;