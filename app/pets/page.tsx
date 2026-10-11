
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

function PetNavbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
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

        <div className="flex flex-wrap items-center gap-5 text-sm sm:text-base">
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
            href="/rewards"
            className="font-semibold text-gray-600 hover:text-orange-600"
          >
            Rewards
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
  );
}

function getPetEmoji(petType: string) {
  if (petType === "Dog") return "🐶";
  if (petType === "Cat") return "🐱";
  return "🐾";
}

function formatDate(date: string | null) {
  if (!date) return "Not added";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not added";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "UNCLAIMED":
      return "bg-yellow-100 text-yellow-700";
    case "LOST":
      return "bg-red-100 text-red-700";
    case "DISABLED":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
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

  // ADD PET FORM
  const [name, setName] = useState("");
  const [type, setType] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");
  const [allergies, setAllergies] = useState("");

  // LOAD PETS
  async function loadPets(showLoader = true) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const response = await fetch("/api/pets", {
        cache: "no-store",
        credentials: "same-origin",
      });

      const data = await response.json();

      const message = String(
        data.message || data.error || ""
      );

      if (
        response.status === 401 ||
        response.status === 403 ||
        (!response.ok &&
          /log\s*in|login|sign\s*in|unauthori[sz]ed/i.test(
            message
          ))
      ) {
        setAuthRequired(true);
        setPets([]);
        setShowForm(false);
        return;
      }

      if (!response.ok) {
        setError(message || "Could not load your pets.");
        return;
      }

      setAuthRequired(false);
      setPets(Array.isArray(data.pets) ? data.pets : []);
    } catch (err) {
      console.error("Load pets error:", err);
      setError("Could not load your pets. Please try again.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();
  }, []);

  // CREATE PET
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        credentials: "same-origin",
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
            data.error ||
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

      await loadPets(false);
      setSuccess("Pet profile created successfully! 🐾");
    } catch (err) {
      console.error("Create pet error:", err);
      setError("Something went wrong while creating the pet profile.");
    } finally {
      setSaving(false);
    }
  }

  // ISSUE PERMANENT PET ID
  async function issuePetId(petId: number) {
    try {
      setIssuingPetId(petId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/pets/${petId}/issue-id`,
        {
          method: "POST",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || data.error || "Could not issue Pet ID."
        );
        return;
      }

      await loadPets(false);

      setSuccess(
        `Pet ID ${data.petId?.petCode || ""} issued successfully! 🪪`
      );
    } catch (err) {
      console.error("Issue Pet ID error:", err);
      setError("Something went wrong while issuing the Pet ID.");
    } finally {
      setIssuingPetId(null);
    }
  }

  // SEND ACTIVATION OTP
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
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Could not send activation OTP."
        );
        return;
      }

      setActivationPetId(petId);

      if (data.demoOtp) {
        setDemoActivationOtp(String(data.demoOtp));
      }

      setSuccess("Activation OTP generated successfully.");
    } catch (err) {
      console.error("Send activation OTP error:", err);
      setError(
        "Something went wrong while generating the activation OTP."
      );
    } finally {
      setSendingActivationOtp(null);
    }
  }

  // CANCEL ACTIVATION
  function cancelActivation() {
    setActivationPetId(null);
    setOtp("");
    setDemoActivationOtp("");
    setError("");
    setSuccess("");
  }

  // ACTIVATE PET ID
  async function activatePetId(petId: number) {
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    try {
      setActivatingPetId(petId);

      const response = await fetch(
        `/api/pets/${petId}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Could not activate Pet ID."
        );
        return;
      }

      setOtp("");
      setDemoActivationOtp("");
      setActivationPetId(null);

      await loadPets(false);

      setSuccess(
        `Pet ID ${data.petId?.petCode || ""} activated successfully! ✅`
      );
    } catch (err) {
      console.error("Activate Pet ID error:", err);
      setError(
        "Something went wrong while activating the Pet ID."
      );
    } finally {
      setActivatingPetId(null);
    }
  }

  // LOADING
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

  // LOGIN REQUIRED
  if (authRequired) {
    return (
      <main className="min-h-screen bg-[#fafaf7]">
        <PetNavbar />

        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-6xl">
              🐶
            </div>

            <h1 className="mt-7 text-3xl font-bold text-slate-900">
              Your Pet Profiles Are Waiting!
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
              Log in or create an account to add your furry
              friends, manage their Pet IDs, view QR codes
              and keep their important details in one place.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/login?next=%2Fpets"
                className="rounded-xl bg-orange-500 px-8 py-3.5 font-bold text-white hover:bg-orange-600"
              >
                Login
              </Link>

              <Link
                href="/signup?next=%2Fpets"
                className="rounded-xl border border-orange-500 bg-white px-8 py-3.5 font-bold text-orange-600 hover:bg-orange-50"
              >
                Create Account
              </Link>
            </div>

            <p className="mt-7 text-sm text-gray-500">
              🐾 Your pet profiles will appear here once you&apos;re signed in.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // MAIN PAGE
  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <PetNavbar />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              PET PROFILES
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              My Pets
            </h1>

            <p className="mt-1 text-sm text-gray-500">
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
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
          >
            {showForm ? "Cancel" : "+ Add Pet"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700"
          >
            {success}
          </div>
        )}

        {/* ADD PET FORM */}
        {showForm && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-slate-900">
              Add a Pet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pet name and type are required. Everything else is optional.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pet-name" className="text-sm font-bold text-slate-700">
                    Pet Name *
                  </label>
                  <input
                    id="pet-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Example: Bruno"
                    required
                    minLength={2}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="pet-type" className="text-sm font-bold text-slate-700">
                    Pet Type *
                  </label>
                  <select
                    id="pet-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className={inputClass}
                  >
                    <option value="Dog">🐶 Dog</option>
                    <option value="Cat">🐱 Cat</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pet-breed" className="text-sm font-bold text-slate-700">
                    Breed
                  </label>
                  <input
                    id="pet-breed"
                    type="text"
                    value={breed}
                    onChange={(event) => setBreed(event.target.value)}
                    placeholder="Example: Labrador"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="pet-gender" className="text-sm font-bold text-slate-700">
                    Gender
                  </label>
                  <select
                    id="pet-gender"
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pet-dob" className="text-sm font-bold text-slate-700">
                    Date of Birth
                  </label>
                  <input
                    id="pet-dob"
                    type="date"
                    value={dateOfBirth}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(event) =>
                      setDateOfBirth(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="pet-weight" className="text-sm font-bold text-slate-700">
                    Weight (kg)
                  </label>
                  <input
                    id="pet-weight"
                    type="number"
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    placeholder="Example: 18.5"
                    min="0.01"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="pet-allergies" className="text-sm font-bold text-slate-700">
                    Allergies
                  </label>
                  <textarea
                    id="pet-allergies"
                    value={allergies}
                    onChange={(event) => setAllergies(event.target.value)}
                    placeholder="Example: Chicken allergy"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-orange-50 p-3">
                <p className="text-xs font-medium text-orange-700">
                  📷 Pet photo upload will be connected later using Cloudinary or AWS S3.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "Saving Pet..." : "Create Pet Profile"}
              </button>
            </form>
          </div>
        )}

        {/* EMPTY STATE */}
        {pets.length === 0 && !showForm && (
          <div className="mt-7 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
            <div className="text-6xl">🐶</div>

            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              No pets added yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Create your first pet profile to get started
              with Pet ID, QR and Paw Points.
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

        {/* COMPACT PET CARDS */}
        {pets.length > 0 && (
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {pets.map((pet) => (
              <article
                key={pet.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* COMPACT PET HEADER */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-yellow-50 px-5 py-4">
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
                      {getPetEmoji(pet.type)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-bold text-slate-900">
                      {pet.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {pet.breed
                        ? `${pet.breed} • ${pet.type}`
                        : pet.type}
                    </p>
                  </div>

                  {pet.petId && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusStyle(
                        pet.petId.status
                      )}`}
                    >
                      {pet.petId.status}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  {/* PET DETAILS GRID */}
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Gender</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {pet.gender || "Not added"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Weight</p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {pet.weight !== null
                          ? `${pet.weight} kg`
                          : "Not added"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">
                        Date of Birth
                      </p>
                      <p className="mt-1 font-semibold text-slate-700">
                        {formatDate(pet.dateOfBirth)}
                      </p>
                    </div>
                  </div>

                  {/* ALLERGIES */}
                  <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                      Allergies
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-700">
                      {pet.allergies || "No allergies added"}
                    </p>
                  </div>

                  {/* PET ID SECTION */}
                  {pet.petId ? (
                    <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                      {/* ID AND QR SIDE BY SIDE */}
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_132px]">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-green-700">
                            Permanent Pet ID
                          </p>

                          <p className="mt-1 break-all text-xl font-extrabold text-green-700">
                            {pet.petId.petCode}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusStyle(
                              pet.petId.status
                            )}`}
                          >
                            {pet.petId.status}
                          </span>

                          {/* ACTIVATE PET ID */}
                          {pet.petId.status === "UNCLAIMED" && (
                            <div className="mt-4">
                              <p className="text-sm font-bold text-orange-700">
                                🔐 Activate Pet ID
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-600">
                                Verify ownership using OTP.
                              </p>

                              {activationPetId !== pet.id ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openActivation(pet.id)
                                  }
                                  disabled={
                                    sendingActivationOtp === pet.id
                                  }
                                  className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                                >
                                  {sendingActivationOtp === pet.id
                                    ? "Sending OTP..."
                                    : "Activate Pet ID"}
                                </button>
                              ) : (
                                <div className="mt-3 space-y-2">
                                  <label
                                    htmlFor={`otp-${pet.id}`}
                                    className="block text-xs font-bold text-orange-700"
                                  >
                                    Enter OTP
                                  </label>

                                  <input
                                    id={`otp-${pet.id}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(event) =>
                                      setOtp(
                                        event.target.value.replace(
                                          /\D/g,
                                          ""
                                        )
                                      )
                                    }
                                    placeholder="6-digit OTP"
                                    className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-center text-sm font-bold tracking-widest outline-none focus:border-orange-500"
                                  />

                                  {demoActivationOtp && (
                                    <div className="rounded-lg bg-yellow-50 p-2 text-xs text-yellow-700">
                                      Development OTP:{" "}
                                      <strong>
                                        {demoActivationOtp}
                                      </strong>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      activatePetId(pet.id)
                                    }
                                    disabled={
                                      activatingPetId === pet.id
                                    }
                                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {activatingPetId === pet.id
                                      ? "Activating..."
                                      : "Verify & Activate"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={cancelActivation}
                                    disabled={
                                      activatingPetId === pet.id
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ACTIVE STATUS */}
                          {pet.petId.status === "ACTIVE" && (
                            <div className="mt-4">
                              <p className="text-sm font-bold text-green-700">
                                ✅ Pet ID Active
                              </p>
                              <p className="mt-1 text-xs text-gray-600">
                                This Pet ID has been successfully activated.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* COMPACT QR CODE */}
                        <div className="flex flex-col items-center rounded-lg bg-white p-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                            Pet ID QR
                          </p>

                          <img
                            src={`/api/pets/${pet.id}/qr`}
                            alt={`QR code for ${pet.name}`}
                            className="mt-2 h-28 w-28 object-contain"
                          />

                          <a
                            href={`/api/pets/${pet.id}/qr`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full rounded-md border border-green-200 px-2 py-2 text-center text-[10px] font-bold text-green-700 hover:bg-green-50"
                          >
                            Open QR Code
                          </a>
                        </div>
                      </div>

                      <p className="mt-3 text-center text-[10px] text-gray-500">
                        Scan the QR to view {pet.name}&apos;s Pet ID.
                        No private owner information is stored in the QR.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-orange-200 bg-orange-50 p-4">
                      <div>
                        <p className="text-sm font-bold text-orange-700">
                          🪪 Pet ID not issued yet
                        </p>
                        <p className="mt-1 text-xs text-orange-600">
                          Issue a permanent Pet ID for {pet.name}.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => issuePetId(pet.id)}
                        disabled={issuingPetId === pet.id}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                      >
                        {issuingPetId === pet.id
                          ? "Issuing ID..."
                          : "Issue Pet ID"}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
