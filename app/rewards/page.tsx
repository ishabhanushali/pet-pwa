
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "../../components/CartProvider";

type RewardTransaction = {
  id: number;
  type: "CREDIT" | "DEBIT";
  points: number;
  reason: string;
  adminName: string | null;
  createdAt: string;
};

type RewardsData = {
  customer: {
    id: number;
    name: string;
  };
  rewards: {
    balance: number;
    totalEarned: number;
    totalUsed: number;
  };
  transactions: RewardTransaction[];
};

const navigation = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "My Pets", href: "/pets" },
  { name: "Orders", href: "/orders" },
  { name: "Rewards", href: "/rewards" },
];

function RewardsNavbar({
  customerName,
}: {
  customerName?: string;
}) {
  const [profileName, setProfileName] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { cartCount } = useCart();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) return;

        const result = await response.json();
        const profile =
          result.customer ?? result.profile ?? result;

        if (
          active &&
          typeof profile?.name === "string"
        ) {
          setProfileName(profile.name);
        }
      } catch (error) {
        console.error("Profile error:", error);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  const name = customerName || profileName;
  const firstName = name.trim().split(/\s+/)[0];

  return (
    <>
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🐾 Little paws, big rewards! Every point counts 💚
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#E9EDE5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-xl font-extrabold text-[#245C46]">
                Pet PWA
              </h1>
              <p className="text-xs text-[#819287]">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold transition hover:text-[#E77B49] ${
                  item.href === "/rewards"
                    ? "text-[#E77B49]"
                    : "text-[#486357]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {name ? (
              <>
                <Link
                  href="/profile"
                  title={name}
                  className="max-w-32 truncate rounded-full bg-[#E8F5E9] px-3 py-2 text-xs font-bold text-[#245C46] sm:max-w-44 sm:px-4 sm:text-sm"
                >
                  👋 Hi, {firstName}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full border border-[#F6D7CB] px-3 py-2 text-xs font-bold text-[#D46F4C] transition hover:bg-[#FFF0E9] disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  {loggingOut ? "..." : "Logout"}
                </button>
              </>
            ) : authLoading ? (
              <span className="text-xs text-[#819287]">
                Loading...
              </span>
            ) : (
              <Link
                href="/login?next=%2Frewards"
                className="rounded-full bg-[#245C46] px-4 py-2 text-sm font-bold text-white"
              >
                Login
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className="relative rounded-full bg-[#FFF0E4] px-3 py-2 text-xl"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF8756] px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto border-t border-[#F0F1EA] px-5 py-3 text-sm font-semibold lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 ${
                item.href === "/rewards"
                  ? "text-[#E77B49]"
                  : "text-[#536A5D]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {logoutError && (
          <p
            role="alert"
            className="px-6 pb-3 text-sm text-red-600"
          >
            {logoutError}
          </p>
        )}
      </nav>
    </>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function RewardsPage() {
  const [data, setData] = useState<RewardsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");

  const loadRewards = useCallback(async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/rewards", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const result = await response.json();

      const message = String(
        result.message || result.error || ""
      );

      if (
        response.status === 401 ||
        (!response.ok &&
          /please login|log in|sign in|unauthori[sz]ed/i.test(
            message
          ))
      ) {
        setAuthRequired(true);
        setData(null);
        return;
      }

      if (!response.ok) {
        setAuthRequired(false);
        setError(
          message || "Could not load Paw Points."
        );
        return;
      }

      setAuthRequired(false);

      setData({
        customer: result.customer,
        rewards: result.rewards,
        transactions: result.transactions || [],
      });
    } catch (err) {
      console.error("Load rewards error:", err);
      setError(
        "Something went wrong while loading Paw Points."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRewards();
  }, [loadRewards]);

  return (
    <main className="min-h-screen bg-[#FFFCF7] text-[#193D32]">
      <RewardsNavbar customerName={data?.customer.name} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#FFF2E6]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#FFE0C9]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#E3F1DF]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:py-16">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-[#D97748] shadow-sm">
              ✨ LITTLE REWARDS, BIG LOVE
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#245C46] sm:text-5xl">
              Your happy{" "}
              <span className="text-[#E98557]">
                Paw Points!
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#688071]">
              Every point tells a little story of love
              for your furry bestie. Keep track of your
              rewards and celebrate every paw-some
              milestone! 💚
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#245C46] px-7 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              Explore Pet Goodies 🛍️
            </Link>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex h-40 w-52 items-center justify-center sm:h-48 sm:w-64"
          >
            <div className="absolute h-40 w-40 rounded-full bg-[#F9DFC9] sm:h-48 sm:w-48" />
            <span className="relative text-7xl drop-shadow-lg sm:text-8xl">
              🏆
            </span>
            <span className="absolute left-0 top-4 text-4xl">
              🐾
            </span>
            <span className="absolute right-0 top-7 text-4xl">
              🎁
            </span>
            <span className="absolute bottom-0 right-4 text-3xl">
              ✨
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        {/* LOADING */}
        {loading ? (
          <div className="rounded-[30px] bg-[#EAF5E9] px-6 py-20 text-center">
            <div className="animate-bounce text-6xl">
              🐾
            </div>
            <p className="mt-5 font-bold text-[#245C46]">
              Gathering your paw-some points...
            </p>
          </div>
        ) : authRequired ? (
          /* LOGIN REQUIRED */
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E3EAE0] bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
              🎁
            </div>

            <h2 className="mt-7 text-3xl font-black text-[#245C46]">
              Unlock your Paw Points!
            </h2>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-[#708476]">
              Sign in to explore your rewards,
              check your points balance, and see
              your transaction history.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login?next=%2Frewards"
                className="rounded-full bg-[#245C46] px-7 py-3.5 font-bold text-white"
              >
                Login to Explore
              </Link>

              <Link
                href="/signup?next=%2Frewards"
                className="rounded-full border border-[#C9DEC9] bg-[#EAF5E9] px-7 py-3.5 font-bold text-[#245C46]"
              >
                Join Pet PWA
              </Link>
            </div>

            <Link
              href="/"
              className="mt-7 inline-block text-sm font-semibold text-[#D97748]"
            >
              ← Back to Home
            </Link>
          </div>
        ) : error || !data ? (
          /* ERROR */
          <div className="mx-auto max-w-lg rounded-[30px] border border-[#E3EAE0] bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-6xl">🐾</div>

            <h2 className="mt-5 text-2xl font-black text-[#245C46]">
              Oops, a little paw-blem!
            </h2>

            <p className="mt-3 text-[#708476]">
              {error || "Could not load your rewards."}
            </p>

            <button
              type="button"
              onClick={() => void loadRewards()}
              className="mt-6 rounded-full bg-[#245C46] px-7 py-3 font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* SECTION TITLE */}
            <div className="mb-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E98557]">
                💚 YOUR REWARDS WALLET
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#245C46] sm:text-3xl">
                Your little treasure chest
              </h2>

              <p className="mt-2 text-sm text-[#708476]">
                A happy home for all your Paw Points.
              </p>
            </div>

            {/* BALANCE CARD */}
            <div className="relative overflow-hidden rounded-[32px] bg-[#245C46] shadow-lg">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#377459] opacity-80" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#347052] opacity-60" />

              <div className="relative grid items-center gap-7 px-7 py-10 sm:px-10 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-[#E2F7E6]">
                    ✨ Available balance
                  </span>

                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-5xl">🐾</span>

                    <span className="text-6xl font-black text-white sm:text-7xl">
                      {data.rewards.balance.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#CDECD6]">
                    Paw Points
                  </p>

                  <p className="mt-5 text-sm text-[#E1F2E5]">
                    Rewards balance for{" "}
                    <span className="font-extrabold text-white">
                      {data.customer.name}
                    </span>
                  </p>
                </div>

                <div
                  aria-hidden="true"
                  className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#DFF2DD] sm:h-44 sm:w-44"
                >
                  <span className="text-7xl sm:text-8xl">
                    🎁
                  </span>
                  <span className="absolute -right-3 top-1 text-3xl">
                    ✨
                  </span>
                  <span className="absolute -bottom-2 left-0 text-3xl">
                    🐾
                  </span>
                </div>
              </div>
            </div>

            {/* REWARD STATS */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-[#D9EBD9] bg-[#EAF5E9] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl">
                    🌱
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#66806C]">
                      Total Earned
                    </p>

                    <p className="mt-1 text-4xl font-black text-[#245C46]">
                      {data.rewards.totalEarned.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#789081]">
                      Paw Points collected
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-[#F5E0D3] bg-[#FFF0E4] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl">
                    🎀
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#9A7866]">
                      Total Used
                    </p>

                    <p className="mt-1 text-4xl font-black text-[#D97748]">
                      {data.rewards.totalUsed.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#A48B7A]">
                      Paw Points used
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="mt-9 overflow-hidden rounded-[30px] border border-[#E3EAE0] bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDF0EA] bg-[#F4F9F1] px-6 py-6 sm:px-8">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
                    🐾 EVERY POINT HAS A STORY
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#245C46]">
                    Points Diary
                  </h2>

                  <p className="mt-2 text-sm text-[#708476]">
                    Your Paw Points transaction history.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadRewards(true)}
                  disabled={refreshing}
                  className="rounded-full border border-[#CFE2D0] bg-white px-5 py-2.5 text-sm font-bold text-[#245C46] transition hover:bg-[#EAF5E9] disabled:opacity-50"
                >
                  {refreshing ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>

              {data.transactions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
                    🐾
                  </div>

                  <h3 className="mt-6 text-xl font-black text-[#245C46]">
                    Your points diary is waiting!
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#708476]">
                    When you earn or use Paw Points,
                    your activity will appear here.
                    Every little milestone deserves
                    a celebration!
                  </p>

                  <Link
                    href="/shop"
                    className="mt-6 inline-flex rounded-full bg-[#245C46] px-6 py-3 text-sm font-extrabold text-white"
                  >
                    Explore the Shop 🛍️
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#EDF0EA] px-5 sm:px-8">
                  {data.transactions.map((transaction) => {
                    const credit =
                      transaction.type === "CREDIT";

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between gap-4 py-5"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                              credit
                                ? "bg-[#EAF5E9]"
                                : "bg-[#FFF0E4]"
                            }`}
                          >
                            {credit ? "🌱" : "🎁"}
                          </div>

                          <div className="min-w-0">
                            <p className="font-extrabold text-[#245C46]">
                              {transaction.reason}
                            </p>

                            <p className="mt-1 text-xs text-[#819287]">
                              {formatDate(
                                transaction.createdAt
                              )}
                            </p>

                            {transaction.adminName && (
                              <p className="mt-1 text-xs text-[#819287]">
                                Added by:{" "}
                                {transaction.adminName}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-xl font-black ${
                              credit
                                ? "text-[#245C46]"
                                : "text-[#D97748]"
                            }`}
                          >
                            {credit ? "+" : "−"}
                            {transaction.points}
                          </p>

                          <p className="mt-1 text-xs text-[#819287]">
                            Paw Points
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ABOUT POINTS */}
            <div className="mt-7 rounded-[26px] border border-[#F4E0D0] bg-[#FFF3E7] p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="text-3xl">💡</span>

                <div>
                  <h3 className="text-lg font-black text-[#245C46]">
                    A little about Paw Points
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#708476]">
                    Paw Points belong to your Pet PWA
                    customer account. Your available
                    balance is calculated from your
                    credit and debit transaction history,
                    so you can always see how many points
                    you have earned and used.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E6EBE2] bg-[#F3F7EF] py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-black text-[#245C46]">
              🐾 Pet PWA
            </h3>

            <p className="mt-2 text-sm text-[#718478]">
              Little paws. Big love. Happy hearts.
            </p>
          </div>

          <p className="text-sm text-[#819287]">
            © 2026 Pet PWA. Made with 💚 for pets.
          </p>
        </div>
      </footer>
    </main>
  );
}
