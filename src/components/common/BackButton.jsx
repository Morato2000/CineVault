import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

function BackButton({ className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10 ${className}`}
    >
      <IoArrowBack className="h-4 w-4" />
      Back
    </button>
  );
}

export default BackButton;