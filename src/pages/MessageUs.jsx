import { useState } from "react";
import { IoMailOutline, IoSend, IoChatbubblesOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import BackButton from "../components/common/BackButton";
import Toast from "../components/common/Toast";

const SUBJECTS = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Other",
];

export default function MessageUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const showToast = (message) => {
    setToast({ show: true, message });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, subject, message } = formData;

    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast("Please complete all required fields.");
      return;
    }

    const supportEmail = "odderratricstudio@gmail.com";

    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(
      `[${subject}] from ${name}`
    )}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;

    window.location.href = mailtoLink;
    showToast("Opening your email client...");
  };

  return (
    <div className="min-h-screen w-full px-5 sm:px-8 lg:px-12 xl:px-16 pt-6 pb-20">
      <div className="mx-auto w-full max-w-7xl">
        <BackButton />

        {/* Header */}
        <div className="mt-10 mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400">
            <IoMailOutline size={17} />
            CineVault Support
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Let's talk<span className="text-red-500">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-400">
            Have a question, found a problem, or have an idea that could make
            CineVault better? We'd love to hear from you.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.4fr] gap-8 lg:gap-12 items-stretch">

          {/* Left Information Panel */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d1d25] via-[#15151c] to-[#101014] p-7 sm:p-10 flex flex-col justify-between min-h-[420px]">
            {/* Decorative background */}
            <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                <IoChatbubblesOutline size={30} />
              </div>

              <h2 className="mt-8 text-2xl sm:text-3xl font-bold text-white">
                We're here to help.
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-7 text-gray-400">
                Your feedback helps us improve your movie and TV discovery
                experience. Tell us what's on your mind.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-red-400">
                    <IoMailOutline size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      Email support
                    </h3>
                    <p className="mt-1 text-sm text-gray-400 break-all">
                      odderratricstudio@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 text-red-400">
                    <IoShieldCheckmarkOutline size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      Your privacy matters
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      Your message is sent through your email application.
                      CineVault does not directly store this contact form submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 border-t border-white/10 pt-6">
              <p className="text-sm text-gray-500">
                Thanks for being part of CineVault.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-white/10 bg-[#17171f] p-6 sm:p-9 lg:p-10 shadow-2xl shadow-black/20">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Fill in the details below and we'll be glad to hear from you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Your name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-4 text-sm text-white placeholder-gray-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Email address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-4 text-sm text-white placeholder-gray-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  What is this about?
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#101016] px-4 py-4 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                >
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Your message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={7}
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#101016] px-4 py-4 text-sm leading-6 text-white placeholder-gray-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 font-semibold text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-red-600/30 active:translate-y-0"
              >
                Send Message
                <IoSend
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                Your email application will open with your message ready to send.
              </p>
            </form>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ show: false, message: "" })}
      />
    </div>
  );
}