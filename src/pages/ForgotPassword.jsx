
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import authBg from "../assets/images/auth-bg.png";
import brandLogo from "../assets/icons/BRAND.svg";
import loginBgLights from "../assets/images/login-fc-lights.png";
import { supabase } from "../services/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    navigate("/reset-password/sent", {
      state: { email },
    });
  };

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#010415]">
      <div
        className="hidden h-full shrink-0 bg-contain bg-center bg-no-repeat lg:block lg:max-w-[45%]"
        style={{
          backgroundImage: `url(${authBg})`,
          aspectRatio: "720 / 1024",
        }}
      />

      <div className="flex flex-1 flex-col bg-[#010415] px-4 sm:px-6">
        <div className="flex justify-center pt-8">
          <Link to="/">
            <img
              src={brandLogo}
              alt="CineVault"
              className="w-40 sm:w-48"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative z-0 w-full max-w-md">
            <div
              className="pointer-events-none absolute -inset-6 -z-10 bg-contain bg-center bg-no-repeat sm:-inset-10 lg:-inset-16"
              style={{
                backgroundImage: `url(${loginBgLights})`,
              }}
            />

            <div className="rounded-2xl bg-gradient-to-b from-[#A855F7] to-[#3B82F6] p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <div className="rounded-[15px] bg-[#181F33] p-6">
                <h1 className="text-center text-2xl font-bold text-white">
                  Forgot your password?
                </h1>

                <p className="mt-2 text-center text-sm text-gray-400">
                  Enter your email and we'll send you a password reset link.
                </p>

                {errorMessage && (
                  <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {errorMessage}
                  </div>
                )}

                <form
                  className="mt-5 space-y-3"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label className="mb-1.5 block text-sm text-white">
                      Email
                    </label>

                    <div className="flex items-center rounded-xl border border-[#2C364F] bg-[#181F32] px-4 py-2.5">
                      <FiMail className="mr-3 h-5 w-5 text-gray-400" />

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your e-mail"
                        className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-400">
                  <Link
                    to="/login"
                    className="font-medium text-purple-400"
                  >
                    ← Back to Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center pb-8">
          <Link
            to="/"
            className="mb-2 flex items-center justify-center gap-1 text-sm font-medium text-purple-400"
          >
            ← Back to Home
          </Link>

          <p className="text-xs text-gray-500">
            © 2026 CineVault. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
