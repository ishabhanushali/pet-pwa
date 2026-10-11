
"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Suspense,
  useState,
  type FormEvent,
} from "react";

// Prevent unsafe redirects
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
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

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

      // Redirect to original page after login
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
    <main className="min-h-screen bg-[#FFFCF7] text-[#245C46]">
      {/* TOP BAR */}
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold text-white">
        🐾 Little paws, big love! 💚
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-[#E5EDE2] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🐾</span>
            <span className="text-xl font-black">
              Pet PWA
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-bold text-[#668071] hover:text-[#E98557]"
          >
            ← Home
          </Link>
        </div>
      </nav>

      {/* LOGIN CARD */}
      <section className="relative flex min-h-[calc(100vh-115px)] items-center justify-center overflow-hidden px-4 py-10">
        {/* DECORATIONS */}
        <div className="pointer-events-none absolute -left-20 top-12 h-52 w-52 rounded-full bg-[#EAF5E9]" />
        <div className="pointer-events-none absolute -right-20 bottom-12 h-60 w-60 rounded-full bg-[#FFE9D9]" />

        <div className="relative w-full max-w-md rounded-[30px] border border-[#E5EDE2] bg-white p-7 shadow-xl shadow-[#245C46]/5 sm:p-9">
          {/* HEADER */}
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
              🐶
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Welcome Back! 💚
            </h1>

            <p className="mt-2 text-sm text-[#708476]">
              Your furry friends missed you!
            </p>
          </div>

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="text-sm font-bold"
              >
                ✉️ Email Address
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
                className="mt-2 w-full rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] px-4 py-3.5 outline-none focus:border-[#245C46] focus:ring-2 focus:ring-[#EAF5E9]"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="login-password"
                className="text-sm font-bold"
              >
                🔒 Password
              </label>

              <div className="relative mt-2">
                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] px-4 py-3.5 pr-20 outline-none focus:border-[#245C46] focus:ring-2 focus:ring-[#EAF5E9]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#E98557]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#245C46] py-4 font-extrabold text-white transition hover:bg-[#194633] disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "🐾 Login"}
            </button>
          </form>

          {/* SIGNUP LINK */}
          <p className="mt-6 text-center text-sm text-[#708476]">
            New to Pet PWA?{" "}
            <Link
              href={signupLink}
              className="font-extrabold text-[#E98557] hover:underline"
            >
              Sign Up
            </Link>
          </p>

          <p className="mt-5 text-center text-xs text-[#A0ADA3]">
            Made with 💚 for your furry friends
          </p>
        </div>
      </section>
    </main>
  );
}

// Suspense required for useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFFCF7]">
          <p className="font-bold text-[#245C46]">
            🐾 Loading Login...
          </p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
