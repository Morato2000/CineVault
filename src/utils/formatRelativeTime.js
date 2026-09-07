export function formatRelativeTime(timestamp) {
  if (!timestamp) return "";

  const diffMs = Date.now() - timestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "Last month";
  return `${Math.floor(diffDays / 30)} months ago`;
}