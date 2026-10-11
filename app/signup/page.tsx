
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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNext(
    searchParams.get("next")
  );

  const loginLink =
    nextPath === "/"
      ? "/login"
      : `/login?next=${encodeURIComponent(nextPath)}`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError(
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Could not create your account."
        );
        return;
      }

      // Redirect to original page after signup
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
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
        🐾 Join our happy pet-loving family! 💚
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

      {/* SIGNUP CARD */}
      <section className="relative flex min-h-[calc(100vh-115px)] items-center justify-center overflow-hidden px-4 py-10">
        {/* DECORATIONS */}
        <div className="pointer-events-none absolute -left-20 top-12 h-52 w-52 rounded-full bg-[#EAF5E9]" />
        <div className="pointer-events-none absolute -right-20 bottom-12 h-60 w-60 rounded-full bg-[#FFE9D9]" />

        <div className="relative w-full max-w-md rounded-[30px] border border-[#E5EDE2] bg-white p-7 shadow-xl shadow-[#245C46]/5 sm:p-9">
          {/* HEADER */}
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF5E9] text-5xl">
              🐶
            </div>

            <h1 className="mt-4 text-3xl font-black">
              Join the Family! 🐾
            </h1>

            <p className="mt-2 text-sm text-[#708476]">
              A happy little world for your pets
            </p>
          </div>

          {/* SIGNUP FORM */}
          <form
            onSubmit={handleSignup}
            className="mt-7 space-y-4"
          >
            {/* NAME */}
            <div>
              <label
                htmlFor="signup-name"
                className="text-sm font-bold"
              >
                👤 Full Name
              </label>

              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your full name"
                className="mt-2 w-full rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] px-4 py-3 outline-none focus:border-[#245C46] focus:ring-2 focus:ring-[#EAF5E9]"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="signup-email"
                className="text-sm font-bold"
              >
                ✉️ Email Address
              </label>

              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Your email"
                className="mt-2 w-full rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] px-4 py-3 outline-none focus:border-[#245C46] focus:ring-2 focus:ring-[#EAF5E9]"
              />
            </div>

            {/* MOBILE */}
            <div>
              <label
                htmlFor="signup-mobile"
                className="text-sm font-bold"
              >
                📱 Mobile Number
              </label>

              <div className="mt-2 flex overflow-hidden rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] focus-within:border-[#245C46]">
                <span className="flex items-center border-r border-[#DCE8DA] px-4 text-sm font-bold">
                  +91
                </span>

                <input
                  id="signup-mobile"
                  type="tel"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="10-digit mobile number"
                  className="w-full min-w-0 px-4 py-3 outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="signup-password"
                className="text-sm font-bold"
              >
                🔒 Password
              </label>

              <div className="relative mt-2">
                <input
                  id="signup-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 8 characters"
                  className="w-full rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] px-4 py-3 pr-20 outline-none focus:border-[#245C46]"
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="signup-confirm"
                className="text-sm font-bold"
              >
                🔐 Confirm Password
              </label>

              <input
                id="signup-confirm"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Re-enter your password"
                className="mt-2 w-full rounded-2xl border border-[#DCE8DA] bg-[#FAFCF8] px-4 py-3 outline-none focus:border-[#245C46] focus:ring-2 focus:ring-[#EAF5E9]"
              />
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

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#245C46] py-4 font-extrabold text-white transition hover:bg-[#194633] disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "🐾 Create Account"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-6 text-center text-sm text-[#708476]">
            Already have an account?{" "}
            <Link
              href={loginLink}
              className="font-extrabold text-[#E98557] hover:underline"
            >
              Login
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
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFFCF7]">
          <p className="font-bold text-[#245C46]">
            🐾 Loading Signup...
          </p>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
