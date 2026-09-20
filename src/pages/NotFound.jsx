import { Link } from "react-router-dom";
import { IoArrowUndoOutline } from "react-icons/io5";
import brandLogo from "../assets/icons/BRAND.svg";
import artDesktop from "../assets/images/404-art-desktop.jpg";
import artTablet from "../assets/images/404-art-tablet.png";
import artMobile from "../assets/images/404-art-mobile.png";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#080D17]">
        {/* CineVault Logo */}
 <Link
  to="/"
  className="absolute left-6 top-6 z-20 sm:left-8 sm:top-8 lg:left-10 lg:top-8"
  aria-label="CineVault Home"
>
  <img
    src={brandLogo}
    alt="CineVault"
    className="h-10 w-auto sm:h-12"
  />
</Link>
      <main className="relative min-h-screen overflow-hidden">
        {/* Background artwork */}
        <picture className="absolute inset-0 block h-full w-full">
          <source media="(min-width: 1024px)" srcSet={artDesktop} />
          <source media="(min-width: 640px)" srcSet={artTablet} />

          <img
            src={artMobile}
            alt=""
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
              sm:object-center
              lg:object-left
            "
          />
        </picture>

        {/* Desktop → darken the right side */}
        <div
          className="
            absolute
            inset-0
            bg-linear-to-r
            from-transparent
            via-[#080D17]/10
            to-[#080D17]/95
          "
        />

        {/* Mobile → darken bottom */}
        <div
          className="
            absolute
            inset-0
            bg-linear-to-t
            from-[#080D17]/95
            via-[#080D17]/30
            to-transparent
            lg:bg-linear-to-r
            lg:from-transparent
            lg:via-[#080D17]/10
            lg:to-[#080D17]/95
          "
        />

        {/* Content */}
        <div
          className="
            relative
            z-10
            flex
            min-h-screen
            w-full
            items-center
            justify-end
            px-6
            py-16
            sm:px-10
            lg:px-16
            xl:px-24
          "
        >
          <div
            className="
              w-full
              max-w-md
              text-center
              sm:max-w-lg
              sm:text-right
              lg:max-w-lg
            "
          >
            <p
              className="
                text-5xl
                font-bold
                text-indigo-500/40
                sm:text-6xl
                lg:text-7xl
              "
            >
              404
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-bold
                leading-tight
                text-white
                sm:text-3xl
                lg:text-4xl
              "
            >
              This scene was{" "}
              <span className="text-purple-400">deleted.</span>
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                text-gray-300
                sm:text-base
              "
            >
              The page you're looking for didn't make
              <br className="hidden sm:block" />
              the final cut.
            </p>

            <Link
              to="/"
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-linear-to-b
                from-[#A855F7]
                to-[#3B82F6]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition-all
                hover:scale-[1.02]
                hover:shadow-lg
                hover:shadow-purple-500/20
              "
            >
              <IoArrowUndoOutline className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="mt-3 text-xs text-gray-500 sm:text-sm">
              Let's get you back to something great.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NotFound;