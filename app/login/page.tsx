
"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";

function getSafeNext(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return "/";
  }

  return value;
}

// LOGIN MESSAGES FOR DIFFERENT PAGES
const loginMessages: Record<string, string> = {
  "/checkout":
    "🛒 Login to continue to checkout. Your cart items will be waiting for you.",

  "/pets":
    "🐶 Login to manage your pets, Pet IDs and QR codes.",

  "/orders":
    "📦 Login to view your orders, track deliveries and reorder your favourite pet essentials.",

  "/rewards":
    "🐾 Login to explore your Paw Points, track your rewards and enjoy exciting benefits for your furry friends.",

  "/profile":
    "👤 Login to manage your profile, save delivery addresses and keep your personal details up to date.",

     "/reminders":
    "🔔 Login to create pet care reminders, manage feeding schedules, medicines, vaccinations and upcoming appointments.",
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNext(
    searchParams.get("next")
  );

  const signupLink =
    nextPath === "/"
      ? "/signup"
      : `/signup?next=${encodeURIComponent(nextPath)}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Invalid email or password."
        );
        return;
      }

      // Return to the original page after login
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">
      {/* HEADER */}
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="text-4xl">🐾</span>

            <div>
              <h1 className="text-xl font-bold">
                Pet PWA
              </h1>

              <p className="text-xs text-slate-300">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <Link
            href={signupLink}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* LOGIN SECTION */}
      <section
        className="flex flex-1 items-center justify-center bg-cover bg-center px-5 py-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.40),rgba(15,23,42,0.40)),url('/images/pet-auth-bg.jpg')",
        }}
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">

          {/* TITLE */}
          <div className="text-center">
            <div className="text-5xl">🐾</div>

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Welcome Back!
            </h2>

            <p className="mt-2 text-gray-500">
              Login to your Pet PWA account
            </p>
          </div>

          {/* CONTEXT-SPECIFIC LOGIN MESSAGE */}
          {loginMessages[nextPath] && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm font-medium leading-6 text-red-600"
            >
              {loginMessages[nextPath]}
            </div>
          )}

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* LOGIN ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging In..."
                : "Login"}
            </button>
          </form>

          {/* SIGN UP LINK */}
          <p className="mt-7 text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={signupLink}
              className="font-bold text-orange-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">

          <div>
            <h3 className="text-xl font-bold">
              🐾 Pet PWA
            </h3>

            <p className="mt-3 text-sm text-gray-400">
              Better care for every pet.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              Quick Links
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/pets">My Pets</Link>
              <Link href="/orders">My Orders</Link>
              <Link href="/rewards">Paw Points</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">
              Need Help?
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/support">
                Customer Support
              </Link>

              <Link href="/rewards">
                Paw Points
              </Link>
            </div>
          </div>

        </div>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading login page...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
