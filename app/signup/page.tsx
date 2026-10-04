"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          mobile,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Could not create account."
        );
        return;
      }

      // Signup API automatically creates login session
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">

      {/* HEADER */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl">
              🐾
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Pet PWA
              </h1>

              <p className="hidden text-xs text-slate-300 sm:block">
                Pet care made simple
              </p>
            </div>
          </Link>

          {/* SIGNUP PAGE: ONLY LOGIN BUTTON */}
          <Link
            href="/login"
            className="rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
          >
            Login
          </Link>
        </div>
      </header>

      {/* BACKGROUND */}
      <section
        className="flex flex-1 items-center justify-center bg-cover bg-center px-4 py-12"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.35), rgba(15,23,42,0.35)), url('/images/pet-auth-bg.jpg')",
        }}
      >
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-9">

          <div className="text-center">
            <div className="text-4xl">🐾</div>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Sign Up
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create your Pet PWA account
            </p>
          </div>

          <form
            onSubmit={handleSignup}
            className="mt-8 space-y-5"
          >

            {/* NAME */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your full name..."
                autoComplete="name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email..."
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* MOBILE */}
            <div>
              <label
                htmlFor="mobile"
                className="mb-2 block font-semibold text-slate-700"
              >
                Phone Number
              </label>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Enter 10-digit mobile number..."
                autoComplete="tel"
                maxLength={10}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password..."
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <p className="mt-1 text-xs text-slate-500">
                Password must contain at least 8 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-semibold text-slate-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your password..."
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* ERROR */}
            {message && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </div>
            )}

            {/* SIGNUP */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-5 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Sign Up"}
            </button>
          </form>

          <p className="mt-7 text-center text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-orange-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-9 sm:grid-cols-3 sm:px-6">

          <div>
            <h3 className="text-lg font-bold">
              🐾 Pet PWA
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Shop pet essentials, manage your pets and keep
              their digital identity in one place.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Quick Links
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
              <Link href="/" className="hover:text-white">
                Home
              </Link>

              <Link
                href="/shop"
                className="hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/pets"
                className="hover:text-white"
              >
                My Pets
              </Link>

              <Link
                href="/rewards"
                className="hover:text-white"
              >
                Paw Points
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">
              Need Help?
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
              <Link
                href="/support"
                className="hover:text-white"
              >
                Customer Support
              </Link>

              <Link
                href="/orders"
                className="hover:text-white"
              >
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}