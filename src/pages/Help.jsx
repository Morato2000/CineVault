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
} from "react-icons/io5";
import { Link } from "react-router-dom";

const FAQS = [
  {
    icon: IoBookmarkOutline,
    question: "How does adding titles to my Watchlist work?",
    answer:
      "Click \"Add to Watchlist\" on any title's page. Your watchlist is saved locally in your browser, so it's always there when you come back — no account needed.",
  },
  {
    icon: IoHeartOutline,
    question: "How do personal ratings work?",
    answer:
      "Once a title is in your Watchlist, click the heart icon on its page to rate it out of 10 (half-points supported). Clicking a rated heart again clears the rating.",
  },
  {
    icon: IoStatsChartOutline,
    question: "Where do the numbers on the Stats page come from?",
    answer:
      "Every stat — genre breakdown, watch time, highest rated — is calculated live from your actual Watchlist. Add or remove titles and the page updates automatically.",
  },
  {
    icon: IoLockClosedOutline,
    question: "Is my data private?",
    answer:
      "Yes. CineVault has no backend account system — everything you save (watchlist, ratings, profile) lives only in your browser's local storage and is never sent anywhere.",
  },
];

function FaqItem({ icon: Icon, question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 py-4 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7947C0]">
          <Icon className="h-4 w-4 text-white" />
        </span>

        <span className="flex-1 text-sm font-semibold text-white">
          {question}
        </span>

        <IoChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <p className="pb-4 pl-12 text-sm leading-relaxed text-gray-400">
          {answer}
        </p>
      )}
    </div>
  );
}

function ContactCard({ icon: Icon, title, description, action, href }) {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7947C0]">
        <Icon className="h-5 w-5 text-white" />
      </span>

      <h3 className="mt-3 font-bold text-white">{title}</h3>

      <p className="mt-1 text-sm text-gray-400">{description}</p>

      <a
        href={href}
        className="mt-3 inline-block text-sm font-semibold text-purple-400 hover:text-purple-300"
      >
        {action} →
      </a>
    </div>
  );
}
function Help() {
  return (
    <div className="px-8 pb-16">
      <h1 className="text-2xl font-bold text-white">Help & Support</h1>
      <p className="mt-1 text-gray-400">Answers to common questions, and ways to reach out.</p>

      <div className="mt-6 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7947C0]">
            <IoHelpCircleOutline className="h-5 w-5 text-white" />
          </span>
          <div>
            <h2 className="font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500">The things people ask us most</p>
          </div>
        </div>

        <div className="mt-2">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
        <ContactCard
          icon={IoMailOutline}
          title="Email Us"
          description="Have a question we haven't covered? Reach out directly."
          action="Send an email"
          href="mailto:support@cinevault.app"
        />
        <ContactCard
          icon={IoBugOutline}
          title="Report a Bug"
          description="Found something broken? Let us know what happened."
          action="Report an issue"
          href="mailto:support@cinevault.app?subject=Bug%20Report"
        />
        <ContactCard
          icon={IoBulbOutline}
          title="Suggest a Feature"
          description="Got an idea to make CineVault better? We'd love to hear it."
          action="Share your idea"
          href="mailto:support@cinevault.app?subject=Feature%20Suggestion"
        />
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Also want to know how your data is handled?{" "}
        <Link to="/privacy-policy" className="text-purple-400 hover:text-purple-300">
          Read our Privacy Policy
        </Link>
      </p>
    </div>
  );
}

export default Help;