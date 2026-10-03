"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: email
              .trim()
              .toLowerCase(),

            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Admin login failed."
        );

        return;
      }

      setMessage(
        "Login successful. Redirecting..."
      );

      setTimeout(() => {
        router.push(
          "/admin/rewards"
        );

        router.refresh();
      }, 600);
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

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
                Admin Panel
              </p>

            </div>

          </Link>

          <Link
            href="/"
            className="font-semibold text-gray-600 hover:text-orange-600"
          >
            ← Customer Site
          </Link>

        </div>

      </nav>

      {/* LOGIN */}

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* HEADER */}

          <div className="mb-8 text-center">

            <div className="text-6xl">
              🔐
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Admin Login
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in to manage Pet PWA.
            </p>

          </div>

          {/* CARD */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Admin Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@petpwa.local"
                  autoComplete="username"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {message && (
                <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
                  {message}
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "🔐 Sign In"}
              </button>

            </form>

          </div>

          <p className="mt-5 text-center text-xs text-gray-400">
            Pet PWA Administration
          </p>

        </div>

      </section>

    </main>
  );
}