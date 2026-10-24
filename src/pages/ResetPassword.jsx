
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineLockClosed } from "react-icons/hi";
import authBg from "../assets/images/auth-bg.png";
import brandLogo from "../assets/icons/BRAND.svg";
import loginBgLights from "../assets/images/login-fc-lights.png";

import { supabase } from "../services/supabaseClient";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setErrorMessage(
          "This password reset link is invalid or has expired."
        );
      }

      setCheckingSession(false);
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Your password has been updated successfully.");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10172A]">
                  <HiOutlineLockClosed className="h-8 w-8 text-purple-400" />
                </div>

                <h1 className="mt-5 text-center text-2xl font-bold text-white">
                  Reset your password
                </h1>

                <p className="mt-2 text-center text-sm text-gray-400">
                  Enter a new password for your CineVault account.
                </p>

                {checkingSession ? (
                  <div className="mt-6 flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  </div>
                ) : errorMessage ? (
                  <div className="mt-6">
                    <p className="rounded-lg bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                      {errorMessage}
                    </p>

                    <Link
                      to="/forgot-password"
                      className="mt-5 block text-center text-sm font-medium text-purple-400"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6">
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        New password
                      </label>

                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="w-full rounded-lg border border-[#3D5B9E] bg-[#10172A] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Confirm new password
                      </label>

                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="w-full rounded-lg border border-[#3D5B9E] bg-[#10172A] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                        {errorMessage}
                      </p>
                    )}

                    {successMessage && (
                      <p className="mt-4 rounded-lg bg-green-500/10 px-4 py-3 text-center text-sm text-green-400">
                        {successMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </form>
                )}

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

export default ResetPassword;
