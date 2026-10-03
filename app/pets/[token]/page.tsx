"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

// ====================================================
// TYPES
// ====================================================

type PublicPet = {
  name: string;
  type: string;
  photoUrl: string | null;
  breed: string | null;
  gender: string | null;
  petCode: string;
  status: string;
};

// ====================================================
// PUBLIC PET PAGE
// ====================================================

export default function PublicPetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [pet, setPet] =
    useState<PublicPet | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD PUBLIC PET
  // ==================================================

  useEffect(() => {
    async function loadPet() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/public/pet/${token}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Pet ID could not be found."
          );

          return;
        }

        setPet(data.pet);
      } catch (error) {
        console.error(
          "Public pet loading error:",
          error
        );

        setError(
          "Something went wrong while loading this Pet ID."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPet();
  }, [token]);

  // ==================================================
  // PET EMOJI
  // ==================================================

  function getPetEmoji(type: string) {
    if (type === "Dog") {
      return "🐶";
    }

    if (type === "Cat") {
      return "🐱";
    }

    return "🐾";
  }

  // ==================================================
  // STATUS UI
  // ==================================================

  function getStatusUI(status: string) {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active Pet ID",
          icon: "✓",
          badge:
            "bg-green-100 text-green-700 border-green-200",
          box:
            "border-green-200 bg-green-50 text-green-700",
        };

      case "LOST":
        return {
          label: "Pet Reported Lost",
          icon: "!",
          badge:
            "bg-red-100 text-red-700 border-red-200",
          box:
            "border-red-200 bg-red-50 text-red-700",
        };

      case "UNCLAIMED":
        return {
          label: "Pet ID Not Activated",
          icon: "!",
          badge:
            "bg-yellow-100 text-yellow-700 border-yellow-200",
          box:
            "border-yellow-200 bg-yellow-50 text-yellow-700",
        };

      default:
        return {
          label: status,
          icon: "•",
          badge:
            "bg-gray-100 text-gray-700 border-gray-200",
          box:
            "border-gray-200 bg-gray-50 text-gray-700",
        };
    }
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
            Loading Pet ID...
          </p>

        </div>

      </main>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error || !pet) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7] px-6">

        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <div className="text-6xl">
            🐾
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Pet ID Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            {error ||
              "This Pet ID link is not available."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            Visit Pet PWA
          </Link>

        </div>

      </main>
    );
  }

  const statusUI =
    getStatusUI(pet.status);

  // ==================================================
  // PUBLIC PET ID
  // ==================================================

  return (
    <main className="min-h-screen bg-[#fafaf7] px-5 py-10">

      <div className="mx-auto max-w-md">

        {/* =========================================== */}
        {/* BRAND */}
        {/* =========================================== */}

        <div className="mb-6 text-center">

          <Link
            href="/"
            className="inline-flex items-center gap-2"
          >

            <span className="text-3xl">
              🐾
            </span>

            <span className="text-xl font-bold text-slate-900">
              Pet PWA
            </span>

          </Link>

          <p className="mt-1 text-xs text-gray-400">
            Digital Pet Identification
          </p>

        </div>

        {/* =========================================== */}
        {/* PET ID CARD */}
        {/* =========================================== */}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">

          {/* ========================================= */}
          {/* CARD HEADER */}
          {/* ========================================= */}

          <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-6 py-6 text-center text-white">

            <p className="text-xs font-bold uppercase tracking-[0.25em]">
              Digital Pet ID
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pet.petCode}
            </p>

          </div>

          {/* ========================================= */}
          {/* ACTIVE VERIFICATION */}
          {/* ========================================= */}

          {pet.status === "ACTIVE" && (

            <div className="border-b border-green-100 bg-green-50 px-6 py-4">

              <div className="flex items-center justify-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                  ✓
                </div>

                <div>

                  <p className="font-bold text-green-700">
                    Active Pet ID
                  </p>

                  <p className="text-xs text-green-600">
                    This Pet ID has been activated.
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* ========================================= */}
          {/* PET PROFILE */}
          {/* ========================================= */}

          <div className="p-7 text-center">

            {/* PHOTO */}

            {pet.photoUrl ? (

              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="mx-auto h-36 w-36 rounded-full border-4 border-orange-100 object-cover"
              />

            ) : (

              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-orange-50 text-7xl">
                {getPetEmoji(pet.type)}
              </div>

            )}

            {/* NAME */}

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              {pet.name}
            </h1>

            {/* BREED / TYPE */}

            <p className="mt-2 text-gray-500">

              {pet.breed
                ? `${pet.breed} • ${pet.type}`
                : pet.type}

            </p>

            {/* GENDER */}

            {pet.gender && (

              <p className="mt-1 text-sm text-gray-400">
                {pet.gender}
              </p>

            )}

            {/* ======================================= */}
            {/* STATUS */}
            {/* ======================================= */}

            <div className="mt-7 border-t border-gray-100 pt-6">

              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Pet ID Status
              </p>

              <span
                className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusUI.badge}`}
              >

                <span>
                  {statusUI.icon}
                </span>

                {statusUI.label}

              </span>

            </div>

            {/* ======================================= */}
            {/* STATUS MESSAGE */}
            {/* ======================================= */}

            <div
              className={`mt-5 rounded-xl border p-4 ${statusUI.box}`}
            >

              {pet.status === "ACTIVE" && (

                <p className="text-sm font-semibold">
                  ✓ This Digital Pet ID is active.
                </p>

              )}

              {pet.status === "UNCLAIMED" && (

                <p className="text-sm font-semibold">
                  This Pet ID has not been activated yet.
                </p>

              )}

              {pet.status === "LOST" && (

                <p className="text-sm font-semibold">
                  This pet has been reported lost.
                </p>

              )}

            </div>

          </div>

          {/* ========================================= */}
          {/* PRIVACY */}
          {/* ========================================= */}

          <div className="border-t border-gray-100 bg-gray-50 p-5 text-center">

            <p className="text-sm font-semibold text-slate-600">
              🔒 Privacy Protected
            </p>

            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-gray-400">
              The owner&apos;s phone number, email and
              home address are not publicly displayed.
            </p>

          </div>

        </div>

        {/* =========================================== */}
        {/* FOOTER */}
        {/* =========================================== */}

        <div className="mt-6 text-center">

          <p className="text-xs text-gray-400">
            Pet identification powered by Pet PWA
          </p>

          <Link
            href="/"
            className="mt-4 inline-block text-sm font-bold text-orange-600 hover:text-orange-700"
          >
            Visit Pet PWA →
          </Link>

        </div>

      </div>

    </main>
  );
}