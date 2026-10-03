"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// ====================================================
// TYPES
// ====================================================

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

// ====================================================
// REWARDS PAGE
// ====================================================

export default function RewardsPage() {
  const [data, setData] =
    useState<RewardsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD REWARDS
  // ==================================================

  async function loadRewards() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/rewards", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Could not load Paw Points."
        );

        return;
      }

      setData({
        customer: result.customer,
        rewards: result.rewards,
        transactions: result.transactions || [],
      });
    } catch (error) {
      console.error(
        "Load rewards error:",
        error
      );

      setError(
        "Something went wrong while loading Paw Points."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  // ==================================================
  // FORMAT DATE
  // ==================================================

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7]">
        <div className="text-center">

          <div className="text-6xl">
            🐾
          </div>

          <p className="mt-4 font-semibold text-gray-600">
            Loading Paw Points...
          </p>

        </div>
      </main>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7] px-6">

        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <div className="text-6xl">
            🐾
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Paw Points
          </h1>

          <p className="mt-3 text-gray-500">
            {error ||
              "Could not load your rewards."}
          </p>

          <button
            type="button"
            onClick={loadRewards}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            Try Again
          </button>

          <div>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-semibold text-orange-600"
            >
              ← Back to Home
            </Link>
          </div>

        </div>

      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* ============================================= */}
      {/* NAVBAR */}
      {/* ============================================= */}

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

          <div className="flex items-center gap-5">

            <Link
              href="/shop"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Shop
            </Link>

            <Link
              href="/pets"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Pets
            </Link>

            <Link
              href="/orders"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Orders
            </Link>

            <Link
              href="/profile"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Profile
            </Link>

          </div>

        </div>

      </nav>

      {/* ============================================= */}
      {/* MAIN CONTENT */}
      {/* ============================================= */}

      <section className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}

        <div>

          <p className="font-bold uppercase tracking-wide text-orange-600">
            REWARDS
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Paw Points 🐾
          </h1>

          <p className="mt-2 text-gray-500">
            Earn Paw Points and keep track of your
            rewards.
          </p>

        </div>

        {/* =========================================== */}
        {/* BALANCE CARD */}
        {/* =========================================== */}

        <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">

          <div className="px-7 py-10 text-center text-white">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">
              Available Balance
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">

              <span className="text-5xl">
                🐾
              </span>

              <span className="text-6xl font-bold">
                {data.rewards.balance}
              </span>

            </div>

            <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-100">
              Paw Points
            </p>

            <p className="mt-4 text-sm text-orange-50">
              Rewards balance for{" "}
              {data.customer.name}
            </p>

          </div>

        </div>

        {/* =========================================== */}
        {/* REWARD STATS */}
        {/* =========================================== */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          {/* EARNED */}

          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
                +
              </div>

              <div>

                <p className="text-sm font-semibold text-gray-500">
                  Total Earned
                </p>

                <p className="mt-1 text-3xl font-bold text-green-700">
                  {data.rewards.totalEarned}
                </p>

                <p className="text-xs text-gray-400">
                  Paw Points
                </p>

              </div>

            </div>

          </div>

          {/* USED */}

          <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
                −
              </div>

              <div>

                <p className="text-sm font-semibold text-gray-500">
                  Total Used
                </p>

                <p className="mt-1 text-3xl font-bold text-red-600">
                  {data.rewards.totalUsed}
                </p>

                <p className="text-xs text-gray-400">
                  Paw Points
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =========================================== */}
        {/* TRANSACTION HISTORY */}
        {/* =========================================== */}

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Transaction History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your Paw Points activity.
              </p>

            </div>

            <button
              type="button"
              onClick={loadRewards}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Refresh
            </button>

          </div>

          {/* ========================================= */}
          {/* NO TRANSACTIONS */}
          {/* ========================================= */}

          {data.transactions.length === 0 && (

            <div className="py-14 text-center">

              <div className="text-6xl">
                🐾
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No transactions yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                When you earn or use Paw Points,
                your transactions will appear here.
              </p>

            </div>

          )}

          {/* ========================================= */}
          {/* TRANSACTIONS */}
          {/* ========================================= */}

          {data.transactions.length > 0 && (

            <div className="mt-6 divide-y divide-gray-100">

              {data.transactions.map(
                (transaction) => (

                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 py-5"
                  >

                    {/* LEFT */}

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                          transaction.type ===
                          "CREDIT"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type ===
                        "CREDIT"
                          ? "+"
                          : "−"}
                      </div>

                      <div>

                        <p className="font-bold text-slate-800">
                          {transaction.reason}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(
                            transaction.createdAt
                          )}
                        </p>

                        {transaction.adminName && (

                          <p className="mt-1 text-xs text-gray-400">
                            Added by:{" "}
                            {transaction.adminName}
                          </p>

                        )}

                      </div>

                    </div>

                    {/* POINTS */}

                    <div className="text-right">

                      <p
                        className={`text-lg font-bold ${
                          transaction.type ===
                          "CREDIT"
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type ===
                        "CREDIT"
                          ? "+"
                          : "−"}
                        {transaction.points}
                      </p>

                      <p className="text-xs text-gray-400">
                        points
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =========================================== */}
        {/* INFO */}
        {/* =========================================== */}

        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">

          <p className="font-bold text-orange-700">
            🐾 About Paw Points
          </p>

          <p className="mt-2 text-sm leading-6 text-orange-700">
            Paw Points are rewards associated with your
            Pet PWA customer account. Your balance is
            calculated from your credit and debit
            transaction history.
          </p>

        </div>

      </section>

    </main>
  );
}