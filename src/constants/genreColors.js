// Colors for Action, Adventure, Comedy, Drama, Science Fiction, and Horror were
// sampled directly from the Genre Breakdown legend on the Stats page design —
// these six should stay in sync with that chart wherever both appear.
// Every other genre below is an invented color, chosen to stay visually
// distinct from the six "real" ones and from each other.
export const GENRE_COLORS = {
  Action: "#562EE6",
  Adventure: "#3458E0",
  "Action & Adventure": "#3458E0",
  Comedy: "#BF3EBA",
  Drama: "#E37F21",
  "Science Fiction": "#E2B637",
  "Sci-Fi & Fantasy": "#E2B637",
  Horror: "#59A3A7",

  Fantasy: "#8B5CF6",
  Thriller: "#DC2626",
  Romance: "#F43F5E",
  Animation: "#22D3EE",
  Crime: "#92400E",
  Mystery: "#1D4ED8",
  Documentary: "#78716C",
  Family: "#4ADE80",
  War: "#4B5563",
  "War & Politics": "#4B5563",
  Western: "#CA8A04",
  Music: "#C026D3",
  History: "#A16207",
  "TV Movie": "#0EA5E9",
  Kids: "#A3E635",
  Reality: "#EA580C",
};

const FALLBACK_COLOR = "#6E727D"; // "Others" — matches the Stats legend's gray dot

export function getGenreColor(genreName) {
  return GENRE_COLORS[genreName] || FALLBACK_COLOR;
}

export function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}