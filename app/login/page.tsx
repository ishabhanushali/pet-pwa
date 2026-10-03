"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [demoOtp, setDemoOtp] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ====================================================
  // SEND OTP
  // ====================================================

  async function sendOtp() {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setDemoOtp("");

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          mobile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Could not send OTP."
        );
        return;
      }

      setOtpSent(true);

      // Development only:
      // backend returns demoOtp when not in production.
      if (data.demoOtp) {
        setDemoOtp(data.demoOtp);
      }

      setMessage(
        data.message || "OTP sent successfully."
      );
    } catch (error) {
      console.error(
        "Send OTP error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // VERIFY OTP
  // ====================================================

  async function verifyOtp() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/auth/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            mobile,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "OTP verification failed."
        );
        return;
      }

      // LOGIN SUCCESS

      setDemoOtp("");

      setMessage(
        `Welcome ${data.customer.name}! Login successful. Redirecting...`
      );

      console.log(
        "Logged in customer:",
        data.customer
      );

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      {/* NAVBAR */}

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <span className="text-3xl">
              🐾
            </span>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Pet PWA
              </h1>

              <p className="text-xs text-gray-500">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="font-semibold text-gray-600 hover:text-orange-600"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* LOGIN */}

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* HEADER */}

          <div className="mb-8 text-center">
            <div className="text-6xl">
              🐾
            </div>

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Welcome to Pet PWA
            </h2>

            <p className="mt-2 text-gray-500">
              Login using your mobile number.
            </p>
          </div>

          {/* LOGIN CARD */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            {/* MOBILE NUMBER */}

            <label className="text-sm font-bold text-slate-700">
              Mobile Number
            </label>

            <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-orange-500">
              <div className="flex items-center bg-gray-50 px-4 font-semibold text-gray-600">
                +91
              </div>

              <input
                type="tel"
                value={mobile}
                maxLength={10}
                disabled={otpSent}
                onChange={(event) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setMobile(value);
                }}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-4 py-3 outline-none disabled:bg-gray-50"
              />
            </div>

            {/* SEND OTP */}

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOtp}
                disabled={
                  loading ||
                  mobile.length !== 10
                }
                className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending..."
                  : "Send OTP"}
              </button>
            ) : (
              <>
                {/* OTP */}

                <label className="mt-6 block text-sm font-bold text-slate-700">
                  Enter OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setOtp(value);
                  }}
                  placeholder="6-digit OTP"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-orange-500"
                />

                {/* DEVELOPMENT OTP */}

                {demoOtp && (
                  <div className="mt-4 rounded-xl bg-orange-50 p-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                      Development Mode
                    </p>

                    <p className="mt-2 text-sm text-orange-700">
                      Your generated OTP
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-[0.25em] text-orange-700">
                      {demoOtp}
                    </p>
                  </div>
                )}

                {/* VERIFY OTP */}

                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>

                {/* CHANGE NUMBER */}

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setDemoOtp("");
                    setMessage("");
                    setError("");
                  }}
                  disabled={loading}
                  className="mt-3 w-full text-sm font-semibold text-gray-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Change mobile number
                </button>
              </>
            )}

            {/* SUCCESS */}

            {message && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <p className="mt-6 text-center text-xs text-gray-400">
              By continuing, you agree to our Terms
              and Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}