"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type TransactionType = "CREDIT" | "DEBIT";

type Result = {
  message: string;

  customer: {
    id: number;
    name: string;
    mobile: string;
  };

  transaction: {
    id: number;
    type: TransactionType;
    points: number;
    reason: string;
    adminName: string | null;
    createdAt: string;
  };

  previousBalance: number;
  balance: number;

  admin?: {
    id: number;
    name: string;
    role: string;
  };
};

export default function AdminRewardsPage() {
  const [customerId, setCustomerId] =
    useState("");

  const [type, setType] =
    useState<TransactionType>("CREDIT");

  const [points, setPoints] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [result, setResult] =
    useState<Result | null>(null);

  // ====================================================
  // UPDATE PAW POINTS
  // ====================================================

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setResult(null);

      // ----------------------------------------------
      // FRONTEND VALIDATION
      // ----------------------------------------------

      const parsedCustomerId =
        Number(customerId);

      const parsedPoints =
        Number(points);

      if (
        !Number.isInteger(parsedCustomerId) ||
        parsedCustomerId <= 0
      ) {
        setError(
          "Please enter a valid Customer ID."
        );

        return;
      }

      if (
        !Number.isInteger(parsedPoints) ||
        parsedPoints <= 0
      ) {
        setError(
          "Points must be a positive whole number."
        );

        return;
      }

      if (reason.trim().length < 3) {
        setError(
          "Please enter a valid reason."
        );

        return;
      }

      // ----------------------------------------------
      // SEND REQUEST
      // ----------------------------------------------

      const response = await fetch(
        "/api/admin/rewards",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customerId:
              parsedCustomerId,

            type,

            points:
              parsedPoints,

            reason:
              reason.trim(),
          }),
        }
      );

      const data =
        await response.json();

      // ----------------------------------------------
      // ADMIN NOT LOGGED IN / SESSION EXPIRED
      // ----------------------------------------------

      if (response.status === 401) {
        setError(
          data.message ||
            "Your admin session is not active. Please login again."
        );

        return;
      }

      // ----------------------------------------------
      // OTHER ERROR
      // ----------------------------------------------

      if (!response.ok) {
        setError(
          data.message ||
            "Could not update Paw Points."
        );

        return;
      }

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      setResult(data);

      setSuccess(
        data.message ||
          "Paw Points updated successfully."
      );

      // Keep Customer ID selected so another
      // transaction can be made if required.
      setPoints("");
      setReason("");
    } catch (error) {
      console.error(
        "Admin rewards error:",
        error
      );

      setError(
        "Something went wrong while updating Paw Points."
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // LOGOUT
  // ====================================================

  async function handleLogout() {
    try {
      setLoggingOut(true);
      setError("");

      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not logout."
        );

        return;
      }

      // Full navigation so the old authenticated
      // client state is completely discarded.
      window.location.href =
        "/admin/login";
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );

      setError(
        "Something went wrong while logging out."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* ============================================ */}
      {/* NAVBAR */}
      {/* ============================================ */}

      <nav className="border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

          {/* LOGO */}

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

          {/* NAVIGATION */}

          <div className="flex items-center gap-3">

            <Link
              href="/"
              className="hidden text-sm font-semibold text-gray-600 transition hover:text-orange-600 sm:block"
            >
              Customer Site
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>

          </div>

        </div>

      </nav>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}

      <section className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}

        <div>

          <p className="font-bold uppercase tracking-wide text-orange-600">
            ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Paw Points Management 🐾
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Add or deduct Paw Points from a
            customer account. Every transaction
            records the authenticated administrator
            automatically.
          </p>

        </div>

        {/* ========================================== */}
        {/* GLOBAL ERROR */}
        {/* ========================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">

            <p className="font-semibold text-red-600">
              {error}
            </p>

            {error
              .toLowerCase()
              .includes("login") && (

              <Link
                href="/admin/login"
                className="mt-3 inline-block text-sm font-bold text-red-600 underline"
              >
                Go to Admin Login
              </Link>

            )}

          </div>
        )}

        {/* ========================================== */}
        {/* SUCCESS */}
        {/* ========================================== */}

        {success && (
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">

            <p className="font-semibold text-green-700">
              {success}
            </p>

          </div>
        )}

        {/* ========================================== */}
        {/* GRID */}
        {/* ========================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          {/* ======================================== */}
          {/* FORM */}
          {/* ======================================== */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <h2 className="text-2xl font-bold text-slate-900">
              Update Paw Points
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the customer and transaction
              details below.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              {/* CUSTOMER ID */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Customer ID *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(
                      event.target.value
                    )
                  }
                  placeholder="Example: 1"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Enter the database ID of the
                  customer whose Paw Points you want
                  to update.
                </p>

              </div>

              {/* TRANSACTION TYPE */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Transaction Type *
                </label>

                <div className="mt-2 grid grid-cols-2 gap-3">

                  {/* CREDIT */}

                  <button
                    type="button"
                    onClick={() =>
                      setType("CREDIT")
                    }
                    className={`rounded-xl border px-4 py-3 font-bold transition ${
                      type === "CREDIT"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    + CREDIT
                  </button>

                  {/* DEBIT */}

                  <button
                    type="button"
                    onClick={() =>
                      setType("DEBIT")
                    }
                    className={`rounded-xl border px-4 py-3 font-bold transition ${
                      type === "DEBIT"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    − DEBIT
                  </button>

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  CREDIT adds points. DEBIT removes
                  points.
                </p>

              </div>

              {/* POINTS */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Paw Points *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={points}
                  onChange={(event) =>
                    setPoints(
                      event.target.value
                    )
                  }
                  placeholder="Example: 100"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

              </div>

              {/* REASON */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Reason *
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  maxLength={250}
                  placeholder="Example: First Pet ID activation"
                  rows={4}
                  required
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {reason.length}/250
                </p>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl px-5 py-3.5 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  type === "CREDIT"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading
                  ? "Updating..."
                  : type === "CREDIT"
                    ? "+ Add Paw Points"
                    : "− Deduct Paw Points"}
              </button>

            </form>

          </div>

          {/* ======================================== */}
          {/* RIGHT COLUMN */}
          {/* ======================================== */}

          <div className="space-y-6">

            {/* SECURITY INFO */}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="text-3xl">
                🔐
              </div>

              <h2 className="mt-3 text-xl font-bold text-slate-900">
                Secure Admin Action
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                The administrator name is taken
                directly from the authenticated
                admin session. It cannot be entered
                manually from this page.
              </p>

            </div>

            {/* EXAMPLE */}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900">
                Example
              </h2>

              <div className="mt-5 space-y-4 text-sm">

                <div>

                  <p className="text-gray-400">
                    Customer ID
                  </p>

                  <p className="font-bold text-slate-700">
                    1
                  </p>

                </div>

                <div>

                  <p className="text-gray-400">
                    Type
                  </p>

                  <p className="font-bold text-green-700">
                    CREDIT
                  </p>

                </div>

                <div>

                  <p className="text-gray-400">
                    Points
                  </p>

                  <p className="font-bold text-slate-700">
                    100
                  </p>

                </div>

                <div>

                  <p className="text-gray-400">
                    Reason
                  </p>

                  <p className="font-bold text-slate-700">
                    First Pet ID activation
                  </p>

                </div>

              </div>

            </div>

            {/* ====================================== */}
            {/* TRANSACTION RESULT */}
            {/* ====================================== */}

            {result && (

              <div className="rounded-3xl border border-green-200 bg-green-50 p-6">

                <div className="text-3xl">
                  ✅
                </div>

                <h2 className="mt-3 text-xl font-bold text-green-800">
                  Transaction Complete
                </h2>

                {/* CUSTOMER */}

                <div className="mt-5">

                  <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                    Customer
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {result.customer.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Customer ID #
                    {result.customer.id}
                  </p>

                </div>

                {/* BALANCES */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-white p-4">

                    <p className="text-xs text-gray-400">
                      Previous
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {result.previousBalance}
                    </p>

                  </div>

                  <div className="rounded-xl bg-white p-4">

                    <p className="text-xs text-gray-400">
                      New Balance
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-700">
                      {result.balance}
                    </p>

                  </div>

                </div>

                {/* TRANSACTION */}

                <div className="mt-3 rounded-xl bg-white p-4">

                  <p className="text-xs text-gray-400">
                    Transaction
                  </p>

                  <p
                    className={`mt-1 text-xl font-bold ${
                      result.transaction
                        .type === "CREDIT"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {result.transaction
                      .type === "CREDIT"
                      ? "+"
                      : "−"}

                    {
                      result.transaction
                        .points
                    }{" "}
                    Paw Points
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {
                      result.transaction
                        .reason
                    }
                  </p>

                </div>

                {/* AUTHENTICATED ADMIN */}

                {result.admin && (

                  <div className="mt-3 rounded-xl bg-white p-4">

                    <p className="text-xs text-gray-400">
                      Performed By
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {result.admin.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {result.admin.role}
                    </p>

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}