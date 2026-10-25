
import { useState } from "react";
import {
  IoHelpCircleOutline,
  IoChevronDown,
  IoMailOutline,
  IoBugOutline,
  IoBulbOutline,
  IoBookmarkOutline,
  IoHeartOutline,
  IoLockClosedOutline,
  IoStatsChartOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";

const FAQS = [
  {
    icon: IoBookmarkOutline,
    question: "How does adding titles to my Watchlist work?",
    answer:
      'Open any movie or TV show and select "Add to Watchlist". Your saved titles can be managed from your Watchlist page.',
  },
  {
    icon: IoHeartOutline,
    question: "How do personal ratings work?",
    answer:
      "Rate titles using the heart rating feature on their details page. You can give a rating out of 10, including half-points, and update or clear it whenever you like.",
  },
  {
    icon: IoStatsChartOutline,
    question: "Where do the numbers on the Stats page come from?",
    answer:
      "Your statistics are calculated from your saved Watchlist activity, including your ratings, genres and tracked titles. They update as your collection changes.",
  },
  {
    icon: IoLockClosedOutline,
    question: "Is my data private?",
    answer:
      "CineVault uses Supabase for account authentication and supported data storage. Your account information and saved activity are handled according to our Privacy Policy.",
  },
];

function FaqItem({ icon: Icon, question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group border-b border-white/[0.07] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 py-5 text-left transition-colors hover:text-white"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-indigo-300 transition group-hover:border-purple-400/40">
          <Icon className="h-5 w-5" />
        </span>

        <span className="flex-1 text-sm sm:text-base font-semibold text-gray-200">
          {question}
        </span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-gray-400 transition group-hover:bg-indigo-500/10 group-hover:text-indigo-300">
          <IoChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pl-[3.75rem] pr-5 text-sm leading-7 text-gray-400">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, title, description, action, to, featured }) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? "border-indigo-400/30 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-purple-600/15"
          : "border-white/[0.08] bg-[#11131d] hover:border-indigo-400/30"
      }`}
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-purple-500/[0.06] blur-3xl transition group-hover:bg-purple-500/10" />

      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-indigo-300">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">
          {description}
        </p>

        <Link
          to={to}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition hover:gap-3 hover:text-purple-300"
        >
          {action}
          <IoArrowForwardOutline className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Help() {
  return (
    <div className="min-h-screen w-full px-5 pb-20 pt-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">

        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-indigo-400/15 bg-gradient-to-br from-[#121a30] via-[#151525] to-[#171329] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px]" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <IoHelpCircleOutline className="h-4 w-4" />
              Help & Support
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              How can we{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
              Find answers, get support, and make the most of your CineVault
              experience. We're here to help you enjoy every discovery.
            </p>

            <Link
              to="/message-us"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/30"
            >
              <IoMailOutline className="h-5 w-5" />
              Contact Support
              <IoArrowForwardOutline className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
          <div className="lg:sticky lg:top-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
              Need an answer?
            </span>

            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Frequently asked questions
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              Quick answers to common questions about your account,
              watchlist, ratings and CineVault features.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <IoShieldCheckmarkOutline className="h-6 w-6 shrink-0 text-indigo-400" />
              <p className="text-xs leading-5 text-gray-400">
                Can't find what you're looking for? Our support page is just
                a click away.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#11131d] px-5 sm:px-7">
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>
        </section>

        {/* Contact options */}
        <section className="mt-16">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                We're listening
              </span>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Still need help?
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Choose how you'd like to get in touch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ContactCard
              icon={IoMailOutline}
              title="General Support"
              description="Have a question or need assistance? Send us a message."
              action="Contact us"
              to="/message-us"
              featured
            />

            <ContactCard
              icon={IoBugOutline}
              title="Report a Bug"
              description="Something isn't working as expected? Tell us what happened."
              action="Report an issue"
              to="/message-us?subject=Bug%20Report"
            />

            <ContactCard
              icon={IoBulbOutline}
              title="Suggest a Feature"
              description="Have an idea that could improve CineVault? We'd love to hear it."
              action="Share your idea"
              to="/message-us?subject=Feature%20Request"
            />
          </div>
        </section>

        {/* Footer link */}
        <div className="mt-12 flex flex-col items-center justify-center gap-2 border-t border-white/[0.07] pt-8 text-center">
          <p className="text-sm text-gray-400">
            Your privacy matters to us.
          </p>
          <Link
            to="/privacy-policy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition hover:text-purple-300"
          >
            Read our Privacy Policy
            <IoArrowForwardOutline className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Help;
