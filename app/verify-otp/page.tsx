"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type OtpDetails = {
  name: string;
  email: string;
  mobile: string;
};

export default function VerifyOtpPage() {
  const router = useRouter();

  const [details, setDetails] = useState<OtpDetails | null>(null);

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD CUSTOMER DETAILS FROM SESSION STORAGE
  // ==================================================

  useEffect(() => {
    const storedData = sessionStorage.getItem("emailOtpData");

    if (!storedData) {
      router.replace("/login");
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);

      if (
        !parsedData.name ||
        !parsedData.email ||
        !parsedData.mobile
      ) {
        sessionStorage.removeItem("emailOtpData");
        router.replace("/login");
        return;
      }

      setDetails({
        name: parsedData.name,
        email: parsedData.email,
        mobile: parsedData.mobile,
      });
    } catch (error) {
      console.error("Could not read OTP details:", error);

      sessionStorage.removeItem("emailOtpData");
      router.replace("/login");
    }
  }, [router]);

  // ==================================================
  // VERIFY OTP
  // ==================================================

  async function handleVerify(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!details) {
      return;
    }

    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: details.name,
          email: details.email,
          mobile: details.mobile,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "OTP verification failed."
        );

        return;
      }

      // OTP successfully verified.
      // Remove temporary signup/login information.
      sessionStorage.removeItem("emailOtpData");

      // Login successful -> Home page
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Verify OTP error:", error);

      setError(
        "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // CHANGE DETAILS
  // ==================================================

  function handleChangeDetails() {
    sessionStorage.removeItem("emailOtpData");

    router.push("/login");
  }

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (!details) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-600">
          Loading...
        </p>
      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl">📧</div>

            <h1 className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              We sent a 6-digit OTP to
            </p>

            <p className="mt-1 break-all font-semibold text-gray-900">
              {details.email}
            </p>
          </div>

          {/* OTP Form */}
          <form
            onSubmit={handleVerify}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Enter OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setOtp(value);
                }}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Verify */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify OTP & Login"}
            </button>
          </form>

          {/* Change Details */}
          <button
            type="button"
            onClick={handleChangeDetails}
            disabled={loading}
            className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Change Details
          </button>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-center text-xs leading-5 text-gray-500">
              The OTP expires in 5 minutes.
              <br />
              Check your spam or junk folder if you
              don&apos;t see the email.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}