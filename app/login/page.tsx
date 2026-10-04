"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          mobile,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Could not send OTP. Please try again."
        );

        return;
      }

      // Store customer details temporarily.
      // OTP itself is NEVER stored here.
      sessionStorage.setItem(
        "emailOtpData",
        JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
        })
      );

      setMessage(
        data.message || "OTP sent successfully. Please check your email."
      );

      // Go to separate OTP verification page
      router.push("/verify-otp");
    } catch (error) {
      console.error("Send OTP error:", error);

      setError(
        "Unable to send OTP. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl">🐾</div>

            <h1 className="text-2xl font-bold text-gray-900">
              Login to Pet PWA
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Enter your details and we&apos;ll send a verification
              code to your email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Mobile */}
            <div>
              <label
                htmlFor="mobile"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

                  setMobile(value);
                }}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                required
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                Enter a valid 10-digit Indian mobile number.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send Email OTP"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Your OTP will be sent to the email address entered above.
          </p>
        </div>
      </div>
    </main>
  );
}