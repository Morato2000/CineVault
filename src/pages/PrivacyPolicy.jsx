import BackButton from "../components/common/BackButton";

function PrivacyPolicy() {
  return (
    <div className="px-8 pb-16">
      <BackButton />
      <h1 className="mt-4 text-2xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-1 text-gray-400">Last updated September 2026</p>

      <div className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-gray-300">
        <p>
          CineVault is a personal project. All data you enter — your watchlist, favorites,
          ratings, and profile details — is stored locally in your browser and is never sent to
          any server. There is no backend account system, and no data leaves your device.
        </p>
        <p>
          Movie and TV metadata (posters, titles, ratings, cast) is fetched live from{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-purple-400">
            The Movie Database (TMDB)
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <p>
          Clearing your browser's local storage, or using "Delete Account" in Settings, will
          permanently remove all locally stored CineVault data.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;