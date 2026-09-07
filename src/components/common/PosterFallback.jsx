import placeholderImage from "../../assets/images/Image Card Placeholder.png";

function PosterFallback({ title, className = "" }) {
  return (
    <img
      src={placeholderImage}
      alt={title}
      className={`object-cover ${className}`}
    />
  );
}

export default PosterFallback;