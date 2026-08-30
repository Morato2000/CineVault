import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa6";
import authBg from "../assets/images/auth-bg.png";
import brandLogo from "../assets/icons/BRAND.svg";
import loginBgLights from "../assets/images/login-fc-lights.png";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#010415]">
      {/* Poster wall background */}
      <div
        className="hidden h-full shrink-0 bg-contain bg-center bg-no-repeat lg:block lg:max-w-[45%]"
        style={{ backgroundImage: `url(${authBg})`, aspectRatio: "720 / 1024" }}
      />

      {/* Form side */}
      <div className="flex flex-1 flex-col bg-[#010415] px-4 sm:px-6">
        {/* Top: logo, 32px from the top */}
        <div className="flex justify-center pt-8">
          <Link to="/">
            <img src={brandLogo} alt="CineVault" className="w-40 sm:w-48" />
          </Link>
        </div>

        {/* Middle: card, centered in whatever space remains */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative z-0 w-full max-w-md">
            <div
              className="pointer-events-none absolute -inset-6 -z-10 bg-contain bg-center bg-no-repeat sm:-inset-10 lg:-inset-16"
              style={{ backgroundImage: `url(${loginBgLights})` }}
            />

            <div className="rounded-2xl bg-gradient-to-b from-[#A855F7] to-[#3B82F6] p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <div className="rounded-[15px] bg-[#181F33] p-6">
                <h1 className="text-center text-2xl font-bold text-white">
                  Welcome Back
                </h1>
                <p className="mt-2 text-center text-sm text-gray-400">
                  Continue your{" "}
                  <span className="text-purple-400">movie journey.</span>
                </p>

                <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1.5 block text-sm text-white">
                      Email
                    </label>
                    <div className="flex items-center rounded-xl border border-[#2C364F] bg-[#181F32] px-4 py-2.5">
                      <FiMail className="mr-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your e-mail"
                        className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm text-white">
                      Password
                    </label>
                    <div className="flex items-center rounded-xl border border-[#2C364F] bg-[#181F32] px-4 py-2.5">
                      <FiLock className="mr-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your password"
                        className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="text-gray-400"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-gray-300">
                      <span className="relative h-4 w-4 shrink-0">
                        <input type="checkbox" className="peer sr-only" />
                        <span className="absolute inset-0 rounded border border-white/30 bg-[#181F32] peer-checked:border-transparent peer-checked:bg-gradient-to-b peer-checked:from-[#A855F7] peer-checked:to-[#3B82F6]" />
                        <svg
                          viewBox="0 0 12 10"
                          className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 fill-none stroke-white stroke-[2] opacity-0 peer-checked:opacity-100"
                        >
                          <path d="M1 5l3 3 7-7" />
                        </svg>
                      </span>
                      Remember Me
                    </label>
                    <Link to="/reset-password" className="text-purple-400">
                      Forget password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] py-2.5 font-semibold text-white"
                  >
                    Sign in →
                  </button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/50" />
                  <span className="text-xs text-white">OR</span>
                  <div className="h-px flex-1 bg-white/50" />
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#5E6979] bg-white/90 py-2.5 font-semibold text-gray-900"
                  >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#5E6979] bg-[#5865F2] py-2.5 font-semibold text-white"
                  >
                    <FaDiscord className="h-5 w-5" />
                    Continue with Discord
                  </button>
                </div>

                <p className="mt-5 text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link to="/register" className="font-medium text-purple-400">
                    Create one.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: back link + copyright, 32px from the bottom */}
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

export default Login;