
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

// SIGNUP MESSAGES FOR DIFFERENT PAGES
const signupMessages: Record<string, string> = {
  "/checkout":
    "🛒 Create your account to continue to checkout. Your cart items will be waiting for you.",

  "/pets":
    "🐶 Create your account to manage your pets, Pet IDs and QR codes.",

  "/orders":
    "📦 Create your account to view your orders, track deliveries and enjoy easy reordering.",

  "/rewards":
    "🐾 Create your account to unlock Paw Points, track your rewards and enjoy exciting benefits for your furry friends.",

  "/profile":
    "👤 Create your Pet PWA account to set up your profile, save delivery addresses and make caring for your pets easier.",
};

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

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
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
            mobile: mobile.trim(),
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

      // Return to the original page after signup.
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
            href={loginLink}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Login
          </Link>
        </div>
      </header>

      {/* SIGNUP SECTION */}
      <section
        className="flex flex-1 items-center justify-center bg-cover bg-center px-5 py-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.40),rgba(15,23,42,0.40)),url('/images/pet-auth-bg.jpg')",
        }}
      >
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl sm:p-10">

          {/* TITLE */}
          <div className="text-center">
            <div className="text-5xl">🐾</div>

            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Create Your Account
            </h2>

            <p className="mt-2 text-gray-500">
              Join Pet PWA and give your pets
              the care they deserve.
            </p>
          </div>

          {/* CONTEXT-SPECIFIC SIGNUP MESSAGE */}
          {signupMessages[nextPath] && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm font-medium leading-6 text-red-600"
            >
              {signupMessages[nextPath]}
            </div>
          )}

          {/* SIGNUP FORM */}
          <form
            onSubmit={handleSignup}
            className="mt-8 space-y-5"
          >
            {/* NAME */}
            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="signup-name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block font-semibold text-slate-700"
              >
                Email Address
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
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* MOBILE */}
            <div>
              <label
                htmlFor="signup-mobile"
                className="mb-2 block font-semibold text-slate-700"
              >
                Mobile Number
              </label>

              <input
                id="signup-mobile"
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel-national"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Enter 10-digit mobile number"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block font-semibold text-slate-700"
              >
                Confirm Password
              </label>

              <input
                id="signup-confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm your password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* SIGNUP ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Sign Up"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="mt-7 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href={loginLink}
              className="font-bold text-orange-600 hover:underline"
            >
              Login
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading signup page...
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
