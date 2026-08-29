import { useEffect, useState } from "react";
import MovieSection from "../components/movies/MovieSection";
import { IoCompassSharp, IoPersonCircleOutline } from "react-icons/io5";
import heroBg from "../assets/images/hero-bg.jpg";
import FeatureHighlights from "../components/home/FeatureHighlights";
import Footer from "../components/layout/Footer";

import {
  WatchlistWaitingCard,
  SaveWhatYouLoveCard,
} from "../components/home/PromoCards";

import {
  getTrendingMovies,
  getPopularMovies,
  getPopularSeries,
  getUpcomingMovies,
} from "../services/tmdb";

function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const [trending, popular, popularTv, upcoming] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getPopularSeries(),
          getUpcomingMovies(),
        ]);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setPopularSeries(popularTv);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error("Failed to load movies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  return (
    <>
      <div className="px-8 pb-12">
        {/* Hero */}
        <section className="relative aspect-[2.3/1] min-h-[280px]xl overflow-hidden rounded-2xl bg-[#161D2D]">
          <div
            className="absolute inset-0 bg-cover bg-right bg-no-repeat"
            style={{ backgroundImage: `url(${heroBg})` }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#080D17]/90 via-[#080D17]/40 to-transparent" />

          <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-10">
            <h1 className="text-4xl font-bold text-white">
              Build Your Next
              <br />
              Watchlist
            </h1>

            <p className="mt-4 text-gray-300">
              Build your personal collection and never lose track of what to
              watch next.
            </p>

            <div className="mt-6 flex gap-4">
              <button className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] px-6 py-3 font-semibold text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                  <IoCompassSharp className="h-5 w-5 text-purple-600" />
                </span>
                Explore
              </button>

              <button className="rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] p-[1px]">
                <span className="flex items-center gap-2 rounded-full bg-[#080D17] px-6 py-3 font-semibold text-white">
                  <IoPersonCircleOutline className="h-5 w-5" />
                  Create free account
                </span>
              </button>
            </div>
          </div>
        </section>
        {/* Trending, with the watchlist CTA card hanging over its bottom-right */}
        <div className="relative">
          <MovieSection title="Trending This Week" movies={trendingMovies} autoScroll loading={loading} />

          <WatchlistWaitingCard className="absolute -bottom-10 right-0 z-20 hidden lg:block" />
        </div>

        {/* Popular, with the feature-checklist card hanging over its bottom-right */}
        <div className="relative">
          <MovieSection
            title="Popular Movies"
            movies={popularMovies}
            type="Movie"
            loading={loading}
          />

          <SaveWhatYouLoveCard className="absolute -bottom-10 right-0 z-20 hidden lg:block" />
        </div>
        <MovieSection
          title="Popular Series"
          movies={popularSeries}
          type="TV Series"
          loading={loading}
        />
        <MovieSection title="Coming Soon" movies={upcomingMovies} loading={loading} />
      </div>
      <FeatureHighlights />
      <Footer />
    </>
  );
}

export default Home;
