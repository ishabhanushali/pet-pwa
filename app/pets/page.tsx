"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Pet = {
  id: number;
  name: string;
  type: string;
  photoUrl: string | null;
  breed: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  weight: number | null;
  allergies: string | null;
  createdAt: string;

  petId: {
    id: number;
    petCode: string;
    status: string;
    qrUrl?: string;
  } | null;
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [issuingPetId, setIssuingPetId] =
    useState<number | null>(null);

  const [sendingActivationOtp, setSendingActivationOtp] =
    useState<number | null>(null);

  const [activatingPetId, setActivatingPetId] =
    useState<number | null>(null);

  const [activationPetId, setActivationPetId] =
    useState<number | null>(null);

  const [otp, setOtp] = useState("");
  const [demoActivationOtp, setDemoActivationOtp] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  // Add Pet form
  const [name, setName] = useState("");
  const [type, setType] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");
  const [allergies, setAllergies] = useState("");

  // ====================================================
  // LOAD PETS
  // ====================================================

  async function loadPets() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/pets", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Could not load your pets."
        );
        return;
      }

      setPets(data.pets || []);
    } catch (error) {
      console.error("Load pets error:", error);

      setError(
        "Could not load your pets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();
  }, []);

  // ====================================================
  // CREATE PET
  // ====================================================

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/pets", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          type,
          breed,
          gender,
          dateOfBirth,
          weight,
          allergies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not create pet profile."
        );
        return;
      }

      setName("");
      setType("Dog");
      setBreed("");
      setGender("");
      setDateOfBirth("");
      setWeight("");
      setAllergies("");

      setShowForm(false);

      await loadPets();

      setSuccess(
        "Pet profile created successfully! 🐾"
      );
    } catch (error) {
      console.error("Create pet error:", error);

      setError(
        "Something went wrong while creating the pet profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ====================================================
  // ISSUE PERMANENT PET ID
  // ====================================================

  async function issuePetId(petId: number) {
    try {
      setIssuingPetId(petId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/pets/${petId}/issue-id`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Could not issue Pet ID."
        );
        return;
      }

      await loadPets();

      setSuccess(
        `Pet ID ${data.petId.petCode} issued successfully! 🪪`
      );
    } catch (error) {
      console.error("Issue Pet ID error:", error);

      setError(
        "Something went wrong while issuing the Pet ID."
      );
    } finally {
      setIssuingPetId(null);
    }
  }

  // ====================================================
  // SEND ACTIVATION OTP
  // ====================================================

  async function openActivation(petId: number) {
    try {
      setSendingActivationOtp(petId);

      setError("");
      setSuccess("");
      setOtp("");
      setDemoActivationOtp("");

      const response = await fetch(
        `/api/pets/${petId}/send-activation-otp`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not send activation OTP."
        );
        return;
      }

      setActivationPetId(petId);

      if (data.demoOtp) {
        setDemoActivationOtp(data.demoOtp);
      }

      setSuccess(
        "Activation OTP generated successfully."
      );
    } catch (error) {
      console.error(
        "Send activation OTP error:",
        error
      );

      setError(
        "Something went wrong while generating the activation OTP."
      );
    } finally {
      setSendingActivationOtp(null);
    }
  }

  // ====================================================
  // CANCEL ACTIVATION
  // ====================================================

  function cancelActivation() {
    setActivationPetId(null);
    setOtp("");
    setDemoActivationOtp("");
    setError("");
    setSuccess("");
  }

  // ====================================================
  // ACTIVATE PET ID
  // ====================================================

  async function activatePetId(petId: number) {
    try {
      setError("");
      setSuccess("");

      if (!otp.trim()) {
        setError("Please enter the OTP.");
        return;
      }

      if (!/^\d{6}$/.test(otp.trim())) {
        setError(
          "OTP must contain exactly 6 digits."
        );
        return;
      }

      setActivatingPetId(petId);

      const response = await fetch(
        `/api/pets/${petId}/activate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not activate Pet ID."
        );
        return;
      }

      setOtp("");
      setDemoActivationOtp("");
      setActivationPetId(null);

      await loadPets();

      setSuccess(
        `Pet ID ${data.petId.petCode} activated successfully! ✅`
      );
    } catch (error) {
      console.error(
        "Activate Pet ID error:",
        error
      );

      setError(
        "Something went wrong while activating the Pet ID."
      );
    } finally {
      setActivatingPetId(null);
    }
  }

  // ====================================================
  // HELPERS
  // ====================================================

  function formatDate(date: string | null) {
    if (!date) {
      return "Not added";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  function getPetEmoji(petType: string) {
    if (petType === "Dog") {
      return "🐶";
    }

    if (petType === "Cat") {
      return "🐱";
    }

    return "🐾";
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-green-200 text-green-800";

      case "LOST":
        return "bg-red-100 text-red-700";

      case "DISABLED":
        return "bg-gray-200 text-gray-700";

      case "UNCLAIMED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7]">
        <div className="text-center">
          <div className="text-6xl">🐾</div>

          <p className="mt-4 font-semibold text-gray-600">
            Loading your pets...
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      {/* NAVBAR */}

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🐾</span>

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

      {/* MAIN */}

      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-bold uppercase tracking-wide text-orange-600">
              PET PROFILES
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              My Pets
            </h1>

            <p className="mt-2 text-gray-500">
              Create and manage profiles for your pets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setSuccess("");
            }}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            {showForm ? "Cancel" : "+ Add Pet"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 font-medium text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-4 font-medium text-green-700">
            {success}
          </div>
        )}

        {/* ADD PET FORM */}

        {showForm && (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Add a Pet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pet name and pet type are required.
              Everything else is optional.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-7"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Pet Name *
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Example: Bruno"
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                {/* TYPE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Pet Type *
                  </label>

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  >
                    <option value="Dog">
                      🐶 Dog
                    </option>

                    <option value="Cat">
                      🐱 Cat
                    </option>
                  </select>
                </div>

                {/* BREED */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Breed
                  </label>

                  <input
                    type="text"
                    value={breed}
                    onChange={(event) =>
                      setBreed(event.target.value)
                    }
                    placeholder="Example: Labrador"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                {/* GENDER */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Gender
                  </label>

                  <select
                    value={gender}
                    onChange={(event) =>
                      setGender(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>
                  </select>
                </div>

                {/* DATE OF BIRTH */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={dateOfBirth}
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(event) =>
                      setDateOfBirth(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                {/* WEIGHT */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Weight (kg)
                  </label>

                  <input
                    type="number"
                    value={weight}
                    onChange={(event) =>
                      setWeight(event.target.value)
                    }
                    placeholder="Example: 18.5"
                    min="0.01"
                    step="0.01"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* ALLERGIES */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Allergies
                </label>

                <textarea
                  value={allergies}
                  onChange={(event) =>
                    setAllergies(
                      event.target.value
                    )
                  }
                  placeholder="Example: Chicken allergy"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="mt-5 rounded-xl bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-700">
                  📷 Pet photo upload will be connected
                  later using Cloudinary or AWS S3.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-xl bg-orange-500 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving Pet..."
                  : "Create Pet Profile"}
              </button>
            </form>
          </div>
        )}

        {/* EMPTY STATE */}

        {pets.length === 0 && !showForm && (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="text-7xl">🐶</div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              No pets added yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Create your first pet profile to get
              started with Pet ID, QR and Paw Points.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              + Add Your First Pet
            </button>
          </div>
        )}

        {/* PET CARDS */}

        {pets.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                {/* PET HEADER */}

                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-7 text-center">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="mx-auto h-28 w-28 rounded-full object-cover"
                    />
                  ) : (
                    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl shadow-sm">
                      {getPetEmoji(pet.type)}
                    </div>
                  )}

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    {pet.name}
                  </h2>

                  <p className="mt-1 text-gray-500">
                    {pet.breed
                      ? `${pet.breed} • ${pet.type}`
                      : pet.type}
                  </p>
                </div>

                {/* PET DETAILS */}

                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        Gender
                      </span>

                      <span className="font-semibold text-slate-700">
                        {pet.gender ||
                          "Not added"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        Date of Birth
                      </span>

                      <span className="font-semibold text-slate-700">
                        {formatDate(
                          pet.dateOfBirth
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        Weight
                      </span>

                      <span className="font-semibold text-slate-700">
                        {pet.weight !== null
                          ? `${pet.weight} kg`
                          : "Not added"}
                      </span>
                    </div>
                  </div>

                  {/* ALLERGIES */}

                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Allergies
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {pet.allergies ||
                        "No allergies added"}
                    </p>
                  </div>

                  {/* PET ID */}

                  <div className="mt-4">
                    {pet.petId ? (
                      <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-green-600">
                              Permanent Pet ID
                            </p>

                            <p className="mt-1 text-2xl font-bold text-green-700">
                              {
                                pet.petId
                                  .petCode
                              }
                            </p>
                          </div>

                          <div className="text-3xl">
                            🪪
                          </div>
                        </div>

                        {/* STATUS */}

                        <div className="mt-3 border-t border-green-100 pt-3">
                          <p className="text-xs text-green-600">
                            Status
                          </p>

                          <span
                            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                              pet.petId
                                .status
                            )}`}
                          >
                            {
                              pet.petId
                                .status
                            }
                          </span>
                        </div>

                        {/* ACTIVATION */}

                        {pet.petId.status ===
                          "UNCLAIMED" && (
                          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="font-bold text-orange-700">
                              🔐 Activate Pet ID
                            </p>

                            <p className="mt-1 text-xs leading-5 text-orange-600">
                              Verify ownership
                              using OTP to
                              activate this Pet
                              ID.
                            </p>

                            {activationPetId !==
                            pet.id ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openActivation(
                                    pet.id
                                  )
                                }
                                disabled={
                                  sendingActivationOtp ===
                                  pet.id
                                }
                                className="mt-3 w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {sendingActivationOtp ===
                                pet.id
                                  ? "Sending OTP..."
                                  : "Activate Pet ID"}
                              </button>
                            ) : (
                              <div className="mt-4">
                                <label className="block text-xs font-bold uppercase tracking-wide text-orange-700">
                                  Enter OTP
                                </label>

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={6}
                                  value={otp}
                                  onChange={(
                                    event
                                  ) =>
                                    setOtp(
                                      event.target.value.replace(
                                        /\D/g,
                                        ""
                                      )
                                    )
                                  }
                                  placeholder="6-digit OTP"
                                  className="mt-2 w-full rounded-lg border border-orange-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.3em] outline-none focus:border-orange-500"
                                />

                                {/* DEVELOPMENT OTP */}

                                {demoActivationOtp && (
                                  <div className="mt-3 rounded-lg bg-yellow-50 p-3">
                                    <p className="text-xs font-semibold text-yellow-700">
                                      Development
                                      mode
                                    </p>

                                    <p className="mt-1 text-xs text-yellow-600">
                                      Your
                                      generated
                                      OTP:{" "}
                                      <strong>
                                        {
                                          demoActivationOtp
                                        }
                                      </strong>
                                    </p>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    activatePetId(
                                      pet.id
                                    )
                                  }
                                  disabled={
                                    activatingPetId ===
                                    pet.id
                                  }
                                  className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {activatingPetId ===
                                  pet.id
                                    ? "Activating..."
                                    : "Verify & Activate"}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelActivation
                                  }
                                  disabled={
                                    activatingPetId ===
                                    pet.id
                                  }
                                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ACTIVE */}

                        {pet.petId.status ===
                          "ACTIVE" && (
                          <div className="mt-4 rounded-xl border border-green-200 bg-white p-4 text-center">
                            <div className="text-3xl">
                              ✅
                            </div>

                            <p className="mt-2 font-bold text-green-700">
                              Pet ID Active
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              This Pet ID has
                              been successfully
                              activated.
                            </p>
                          </div>
                        )}

                        {/* QR CODE */}

                        <div className="mt-4 rounded-xl bg-white p-4 text-center">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Pet ID QR Code
                          </p>

                          <img
                            src={`/api/pets/${pet.id}/qr`}
                            alt={`QR code for ${pet.name}`}
                            className="mx-auto mt-3 h-44 w-44 object-contain"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            Scan to view{" "}
                            {pet.name}
                            &apos;s Pet ID
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-400">
                            No private owner
                            information is
                            stored in the QR.
                          </p>
                        </div>

                        <a
                          href={`/api/pets/${pet.id}/qr`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-center text-sm font-bold text-green-700 hover:bg-green-100"
                        >
                          Open QR Code
                        </a>
                      </div>
                    ) : (
                      /* NO PET ID */

                      <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-4">
                        <p className="font-semibold text-orange-700">
                          🪪 Pet ID not issued
                          yet
                        </p>

                        <p className="mt-1 text-xs text-orange-600">
                          Issue a permanent Pet
                          ID for {pet.name}.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            issuePetId(
                              pet.id
                            )
                          }
                          disabled={
                            issuingPetId ===
                            pet.id
                          }
                          className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {issuingPetId ===
                          pet.id
                            ? "Issuing ID..."
                            : "Issue Pet ID"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}