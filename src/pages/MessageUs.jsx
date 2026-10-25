import { useState } from "react";
import { IoMailOutline, IoSend } from "react-icons/io5";
import BackButton from "../components/common/BackButton";
import Toast from "../components/common/Toast";

const SUBJECTS = ["General Inquiry", "Bug Report", "Feature Request", "Other"];

function MessageUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setToastMessage("Please fill in your name, email, and message.");
      return;
    }

    const body = `From: ${form.name} (${form.email})\n\n${form.message}`;
    const mailtoUrl = `mailto:odderratricstudio@gmail.com?subject=${encodeURIComponent(
      `[${form.subject}] from ${form.name}`
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setToastMessage("Opening your email client...");
  };

  return (
    <div className="px-8 pb-16">
      <BackButton />

      <div className="mt-5 max-w-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7947C0]">
            <IoMailOutline className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Message Us</h1>
            <p className="text-xs text-gray-500">
              We'll get back to you as soon as we can.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-indigo-500/30 bg-[#0B0F1A] p-5"
        >
          <div>
            <label className="mb-1.5 block text-sm text-gray-300">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gray-300">Subject</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gray-300">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              placeholder="What's on your mind?"
              className="w-full resize-none rounded-lg border border-white/10 bg-[#181F32] px-3 py-2 text-sm text-white outline-none focus:border-purple-500/50"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#A855F7] to-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <IoSend className="h-4 w-4" />
            Send Message
          </button>

          <p className="text-center text-xs text-gray-500">
            This opens your default email app with the message pre-filled —
            CineVault has no backend to receive messages directly.
          </p>
        </form>
      </div>

      <Toast message={toastMessage} show={!!toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default MessageUs;