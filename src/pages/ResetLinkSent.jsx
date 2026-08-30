import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { HiOutlineMailOpen } from "react-icons/hi";
import authBg from "../assets/images/auth-bg.png";
import brandLogo from "../assets/icons/BRAND.svg";
import loginBgLights from "../assets/images/login-fc-lights.png";
import SentMgImage from "../assets/images/sent-mg-image.png";

function ResetLinkSent() {
  const location = useLocation();
  const email = location.state?.email ?? "your email";
  const [secondsLeft, setSecondsLeft] = useState(30);

  const handleResend = () => {
    setSecondsLeft(30);
  };

  return (
    <div className="flex h-screen overflow-x-hidden bg-[#010415]">
      <div
        className="hidden h-full shrink-0 bg-contain bg-center bg-no-repeat lg:block lg:max-w-[45%]"
        style={{ backgroundImage: `url(${authBg})`, aspectRatio: "720 / 1024" }}
      />

      <div className="flex flex-1 flex-col bg-[#010415] px-4 sm:px-6">
        <div className="flex justify-center pt-8">
          <Link to="/">
            <img src={brandLogo} alt="CineVault" className="w-40 sm:w-48" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative z-0 w-full max-w-md">
            <div
              className="pointer-events-none absolute -inset-6 -z-10 bg-contain bg-center bg-no-repeat sm:-inset-10 lg:-inset-16"
              style={{ backgroundImage: `url(${loginBgLights})` }}
            />

            <div className="rounded-2xl bg-gradient-to-b from-[#A855F7] to-[#3B82F6] p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <div className="rounded-[15px] bg-[#181F33] p-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl">
                  <img
                    src={SentMgImage}
                    alt="Sent Mail"
                    className="h-20 w-20 object-contain"
                  />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-white">
                  Check your inbox
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                  We've sent a password reset link to{" "}
                  <span className="text-purple-400">{email}</span>
                </p>

                <p className="mt-4 text-sm text-gray-400">
                  Didn't receive it? Check your spam folder or resend in{" "}
                  <span className="text-purple-400">{secondsLeft}</span>{" "}
                  seconds.
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={secondsLeft > 0}
                  className="mt-6 w-full rounded-full bg-gradient-to-b from-[#A855F7] to-[#3B82F6] py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  Open Email
                </button>

                <p className="mt-5 text-sm text-gray-400">
                  <Link to="/login" className="font-medium text-purple-400">
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

export default ResetLinkSent;
