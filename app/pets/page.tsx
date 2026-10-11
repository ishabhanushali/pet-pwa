
"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type Pet = {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  photoUrl: string | null;
  dateOfBirth: string | null;
  weight: number | null;
  allergies: string | null;
  petId: {
    petCode: string;
    status: string;
    qrUrl?: string;
  } | null;
};

type Celebration = {
  name: string;
  code: string;
  type: string;
};

const links = [
  { name: "Shop", href: "/shop" },
  { name: "My Pets", href: "/pets" },
  { name: "Orders", href: "/orders" },
  { name: "Rewards", href: "/rewards" },
  { name: "Reminders", href: "/reminders" },
  { name: "Support", href: "/support" },
];

const inputStyle =
  "w-full rounded-xl border border-[#DDE8DD] bg-white px-4 py-3 text-sm text-[#194532] outline-none focus:border-[#205D43]";

function Navbar({
  customerName,
}: {
  customerName: string;
}) {
  const firstName = customerName.trim().split(/\s+/)[0];

  return (
    <>
      <div className="bg-[#205D43] px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        🐾 Everything your furry friend loves, all in one place!
      </div>

      <header className="border-b border-[#E9E8E1] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black text-[#194532]"
          >
            <span className="rounded-xl bg-[#FFECD7] p-2">
              🐾
            </span>
            Pet PWA
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#194532]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/pets"
                    ? "text-[#D36F39]"
                    : "hover:text-[#D36F39]"
                }
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/cart"
              className="rounded-xl bg-[#EAF4EB] px-3 py-2"
            >
              🛒 Cart
            </Link>

            <Link
              href="/profile"
              className="whitespace-nowrap rounded-xl bg-[#FFF1DD] px-3 py-2"
            >
              👤 {firstName ? `Hi, ${firstName}` : "Profile"}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

function petEmoji(type: string) {
  return type === "Dog"
    ? "🐶"
    : type === "Cat"
      ? "🐱"
      : "🐾";
}

function formatDate(date: string | null) {
  if (!date) return "Not added";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not added";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InfoCard({
  emoji,
  title,
  value,
}: {
  emoji: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FFFCF8] p-4">
      <p className="text-xl">{emoji}</p>
      <p className="mt-2 text-xs text-[#708579]">
        {title}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-[#194532]">
        {value}
      </p>
    </div>
  );
}

function CelebrationPopup({
  celebration,
  onClose,
}: {
  celebration: Celebration;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10291F]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activation-success-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[36px] bg-[#FFFCF8] p-7 text-center shadow-2xl sm:p-9">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute right-5 top-5 rounded-full bg-white px-3 py-2 text-[#60786B] shadow-sm"
        >
          ✕
        </button>

        <div className="pointer-events-none absolute left-5 top-10 animate-bounce text-3xl">
          🎊
        </div>

        <div className="pointer-events-none absolute right-12 top-16 animate-bounce text-3xl">
          🎉
        </div>

        <div className="pointer-events-none absolute bottom-28 left-5 text-2xl">
          ✨
        </div>

        <div className="pointer-events-none absolute bottom-20 right-6 text-2xl">
          🐾
        </div>

        <div className="mx-auto mt-4 flex h-28 w-28 animate-bounce items-center justify-center rounded-full border-8 border-white bg-[#E8F2E7] text-6xl shadow-lg">
          {petEmoji(celebration.type)}
        </div>

        <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#D36F39]">
          ✨ A PAW-SOME MOMENT ✨
        </p>

        <h2
          id="activation-success-title"
          className="mt-3 text-3xl font-black leading-tight text-[#194532]"
        >
          Yay! You&apos;re Official! 🎉
        </h2>

        <p className="mt-4 text-sm leading-7 text-[#60786B]">
          Hooray!{" "}
          <span className="font-black text-[#205D43]">
            {celebration.name}
          </span>
          &apos;s Pet ID is now officially activated!
          Your furry friend is ready for new adventures.
        </p>

        <div className="mt-6 rounded-3xl bg-[#FFF0DC] px-5 py-6">
          <p className="text-xs font-black uppercase tracking-widest text-[#B96035]">
            🏷️ Permanent Pet ID
          </p>

          <p className="mt-2 break-all text-3xl font-black tracking-wide text-[#D36F39]">
            {celebration.code}
          </p>

          <span className="mt-3 inline-block rounded-full bg-[#DDF4E4] px-4 py-2 text-xs font-black text-[#205D43]">
            ✓ Successfully Activated
          </span>
        </div>

        <p className="mt-5 text-xs text-[#708579]">
          Every pet is one of a kind. 💚
        </p>

        <button
          type="button"
          onClick={() => {
            onClose();
            document
              .getElementById("my-pet-cards")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-7 w-full rounded-2xl bg-[#205D43] px-6 py-4 font-black text-white transition hover:bg-[#174934]"
        >
          View My Pet ID 🐾
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-sm font-bold text-[#708579]"
        >
          Keep Celebrating! ✨
        </button>
      </div>
    </div>
  );
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [issuingId, setIssuingId] = useState<number | null>(
    null
  );
  const [sendingOtp, setSendingOtp] = useState<number | null>(
    null
  );
  const [activating, setActivating] = useState<number | null>(
    null
  );
  const [removingId, setRemovingId] = useState<number | null>(
    null
  );

  const [activationPetId, setActivationPetId] =
    useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const [celebration, setCelebration] =
    useState<Celebration | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");
  const [allergies, setAllergies] = useState("");

  async function loadPets(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch("/api/pets", {
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        setAuthRequired(true);
        setPets([]);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not load pets."
        );
      }

      setAuthRequired(false);
      setPets(Array.isArray(data.pets) ? data.pets : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load pets."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "same-origin",
        });

        if (!response.ok) return;

        const data = await response.json();

        setCustomerName(
          data.customer?.name ??
            data.profile?.name ??
            data.name ??
            ""
        );
      } catch (err) {
        console.error("Profile error:", err);
      }
    }

    loadProfile();
  }, []);

  async function addPet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
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
        throw new Error(
          data.error || data.message || "Could not add pet."
        );
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
      setSuccess("Your furry friend has joined the family! 🐾");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add pet."
      );
    } finally {
      setSaving(false);
    }
  }

  async function issuePetId(petId: number) {
    setIssuingId(petId);
    setError("");

    try {
      const response = await fetch(
        `/api/pets/${petId}/issue-id`,
        {
          method: "POST",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not issue Pet ID."
        );
      }

      await loadPets(false);
      setSuccess("Your pet has a new permanent ID! 🏷️");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not issue Pet ID."
      );
    } finally {
      setIssuingId(null);
    }
  }

  async function sendActivationOtp(petId: number) {
    setSendingOtp(petId);
    setError("");
    setSuccess("");
    setOtp("");
    setDemoOtp("");

    try {
      const response = await fetch(
        `/api/pets/${petId}/send-activation-otp`,
        {
          method: "POST",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Could not send activation OTP."
        );
      }

      setActivationPetId(petId);
      setDemoOtp(
        data.demoOtp ? String(data.demoOtp) : ""
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send OTP."
      );
    } finally {
      setSendingOtp(null);
    }
  }

  async function activatePetId(pet: Pet) {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setActivating(pet.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/pets/${pet.id}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ otp: otp.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Could not activate Pet ID."
        );
      }

      const code =
        data.petId?.petCode ||
        pet.petId?.petCode ||
        "Activated";

      setOtp("");
      setDemoOtp("");
      setActivationPetId(null);

      await loadPets(false);

      // Show celebration ONLY after successful activation.
      setCelebration({
        name: pet.name,
        code,
        type: pet.type,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not activate Pet ID."
      );
    } finally {
      setActivating(null);
    }
  }

  async function removePetId(pet: Pet) {
    const confirmed = window.confirm(
      `Remove ${pet.name}'s Pet ID ${pet.petId?.petCode}?\n\nThis will disable the permanent ID. The pet profile will remain saved.`
    );

    if (!confirmed) return;

    setRemovingId(pet.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/pets/${pet.id}/remove-id`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Could not remove Pet ID."
        );
      }

      await loadPets(false);
      setSuccess(
        `${pet.name}'s Pet ID has been disabled. The pet profile is safe.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not remove Pet ID."
      );
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF8] text-[#194532]">
        <div className="text-center">
          <div className="animate-bounce text-6xl">🐾</div>
          <p className="mt-4 font-bold">
            Loading your furry family...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCF8] text-[#194532]">
      <Navbar customerName={customerName} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {authRequired ? (
          <div className="rounded-3xl bg-[#E8F2E7] p-10 text-center">
            <div className="text-6xl">🐶</div>
            <h1 className="mt-5 text-3xl font-black">
              Your furry family awaits!
            </h1>
            <p className="mt-3 text-[#60786B]">
              Please log in to manage your pets.
            </p>
            <Link
              href="/login?next=%2Fpets"
              className="mt-6 inline-block rounded-xl bg-[#205D43] px-6 py-3 font-bold text-white"
            >
              Login
            </Link>
          </div>
        ) : (
          <>
            {/* WELCOME BANNER */}
            <section className="rounded-[32px] bg-[#E8F2E7] px-6 py-8 sm:px-10">
              <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
                <div className="max-w-xl">
                  <p className="text-xs font-black uppercase tracking-widest text-[#D36F39]">
                    🐾 YOUR LITTLE FAMILY
                  </p>

                  <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                    Their world,
                    <br />
                    your love. 💚
                  </h1>

                  <p className="mt-4 max-w-md text-sm leading-7 text-[#60786B]">
                    A happy little corner for your furry
                    family. Keep their details, Pet IDs and
                    special memories in one place.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="mt-6 rounded-xl bg-[#205D43] px-6 py-3 text-sm font-black text-white"
                  >
                    {showForm ? "Cancel" : "+ Add a Pet"}
                  </button>
                </div>

                {/* COMPACT PHOTO */}
                <div className="relative shrink-0">
                  <div className="h-[160px] w-[180px] overflow-hidden rounded-[28px] border-4 border-white bg-[#FFF1DD] shadow-xl sm:h-[220px] sm:w-[260px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=85"
                      alt="Happy dogs"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-bold text-[#D36F39] shadow">
                    Made with love 🐾
                  </span>
                </div>
              </div>
            </section>

            {/* MESSAGES */}
            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-6 rounded-2xl border border-green-200 bg-[#EAF7ED] p-4 text-sm font-semibold text-[#205D43]"
              >
                {success}
              </div>
            )}

            {/* ADD PET FORM */}
            {showForm && (
              <form
                onSubmit={addPet}
                className="mt-8 rounded-[28px] border border-[#E9E8E1] bg-white p-6 shadow-sm"
              >
                <h2 className="mb-6 text-2xl font-black">
                  Tell us about your pet 🐶
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-bold">
                    Pet Name *
                    <input
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputStyle}
                      placeholder="Bruno"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-bold">
                    Pet Type *
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={inputStyle}
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-bold">
                    Breed
                    <input
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className={inputStyle}
                      placeholder="Labrador"
                    />
                  </label>

                  <label className="space-y-2 text-sm font-bold">
                    Gender
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={inputStyle}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </label>

                  <label className="space-y-2 text-sm font-bold">
                    Birthday
                    <input
                      type="date"
                      value={dateOfBirth}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setDateOfBirth(e.target.value)
                      }
                      className={inputStyle}
                    />
                  </label>

                  <label className="space-y-2 text-sm font-bold">
                    Weight (kg)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={inputStyle}
                    />
                  </label>

                  <label className="space-y-2 text-sm font-bold sm:col-span-2">
                    Allergies
                    <textarea
                      rows={3}
                      value={allergies}
                      onChange={(e) =>
                        setAllergies(e.target.value)
                      }
                      className={inputStyle}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 rounded-xl bg-[#205D43] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Create Pet Profile 🐾"}
                </button>
              </form>
            )}

            {/* PETS SECTION */}
            <section id="my-pet-cards" className="mt-12">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#D36F39]">
                    ALL PAWS WELCOME
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-4xl">
                    Meet your furry family 🐾
                  </h2>

                  <p className="mt-2 text-sm text-[#708579]">
                    A special space for every little personality.
                  </p>
                </div>

                <span className="rounded-full bg-[#FFF0DC] px-5 py-2 text-sm font-bold text-[#B96035]">
                  🐾 {pets.length}{" "}
                  {pets.length === 1 ? "Pet" : "Pets"}
                </span>
              </div>

              {pets.length === 0 && (
                <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
                  <p className="text-6xl">🐶🐱</p>
                  <h3 className="mt-5 text-2xl font-black">
                    No pets added yet!
                  </h3>
                  <p className="mt-3 text-[#708579]">
                    Add your first furry friend to get started.
                  </p>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                {pets.map((pet) => (
                  <article
                    key={pet.id}
                    className="min-w-0 overflow-hidden rounded-[28px] border border-[#E9E8E1] bg-white shadow-sm"
                  >
                    {/* PET HEADER */}
                    <div className="flex items-center gap-4 bg-[#FFF0DC] p-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-4xl shadow-sm">
                        {pet.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={pet.photoUrl}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          petEmoji(pet.type)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-xl font-black">
                          {pet.name} 💛
                        </h3>

                        <p className="mt-1 text-sm text-[#60786B]">
                          Your little sunshine
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#B96035]">
                          {pet.breed
                            ? `${pet.breed} · ${pet.type}`
                            : pet.type}
                        </p>
                      </div>

                      {pet.petId && (
                        <span className="rounded-full bg-[#FFF0C2] px-3 py-1 text-[10px] font-black text-[#A66A00]">
                          {pet.petId.status}
                        </span>
                      )}
                    </div>

                    <div className="p-4 sm:p-5">
                      {/* PET DETAILS */}
                      <div className="grid grid-cols-2 gap-3">
                        <InfoCard
                          emoji="🎂"
                          title="Birthday"
                          value={formatDate(pet.dateOfBirth)}
                        />

                        <InfoCard
                          emoji="⚖️"
                          title="Weight"
                          value={
                            pet.weight !== null
                              ? `${pet.weight} kg`
                              : "Not added"
                          }
                        />

                        <InfoCard
                          emoji="🐾"
                          title="Gender"
                          value={pet.gender || "Not added"}
                        />

                        <InfoCard
                          emoji="💚"
                          title="Allergies"
                          value={
                            pet.allergies ||
                            "No allergies added"
                          }
                        />
                      </div>

                      {/* DIGITAL PET ID */}
                      {pet.petId ? (
                        <div className="mt-5 rounded-3xl bg-[#EAF7ED] p-4">
                          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_125px]">
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase text-[#205D43]">
                                🏷️ My Digital Pet ID
                              </p>

                              <p className="mt-2 break-all text-2xl font-black text-[#205D43]">
                                {pet.petId.petCode}
                              </p>

                              <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#205D43]">
                                {pet.petId.status}
                              </span>

                              <p className="mt-3 text-xs leading-6 text-[#60786B]">
                                Your pet&apos;s unique identity,
                                just one scan away.
                              </p>

                              {pet.petId.status === "UNCLAIMED" && (
                                <div className="mt-4">
                                  <p className="text-sm font-black">
                                    🔐 Activate Pet ID
                                  </p>

                                  <p className="mt-1 text-xs text-[#60786B]">
                                    Verify ownership using OTP.
                                  </p>

                                  {activationPetId !== pet.id ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        sendActivationOtp(pet.id)
                                      }
                                      disabled={sendingOtp === pet.id}
                                      className="mt-3 rounded-xl bg-[#205D43] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
                                    >
                                      {sendingOtp === pet.id
                                        ? "Sending OTP..."
                                        : "Activate Pet ID"}
                                    </button>
                                  ) : (
                                    <div className="mt-4 space-y-3">
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Enter 6-digit OTP"
                                        aria-label="Activation OTP"
                                        value={otp}
                                        onChange={(e) =>
                                          setOtp(
                                            e.target.value.replace(
                                              /\D/g,
                                              ""
                                            )
                                          )
                                        }
                                        className={inputStyle}
                                      />

                                      {demoOtp && (
                                        <p className="rounded-xl bg-[#FFF0DC] p-3 text-xs font-bold text-[#B96035]">
                                          Development OTP: {demoOtp}
                                        </p>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          activatePetId(pet)
                                        }
                                        disabled={
                                          activating === pet.id
                                        }
                                        className="w-full rounded-xl bg-[#205D43] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
                                      >
                                        {activating === pet.id
                                          ? "Activating..."
                                          : "Verify & Activate"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActivationPetId(null);
                                          setOtp("");
                                          setDemoOtp("");
                                        }}
                                        className="w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-[#60786B]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {pet.petId.status === "ACTIVE" && (
                                <p className="mt-4 text-sm font-black text-[#205D43]">
                                  🎉 Pet ID Activated!
                                </p>
                              )}

                              {pet.petId.status === "DISABLED" && (
                                <p className="mt-4 text-xs font-bold text-red-600">
                                  This Pet ID has been disabled.
                                </p>
                              )}

                              {/* REMOVE PET ID */}
                              {pet.petId.status !== "DISABLED" && (
                                <button
                                  type="button"
                                  onClick={() => removePetId(pet)}
                                  disabled={removingId === pet.id}
                                  className="mt-4 block rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                  {removingId === pet.id
                                    ? "Removing..."
                                    : "🗑️ Remove Pet ID"}
                                </button>
                              )}
                            </div>

                            {/* QR */}
                            {pet.petId.status !== "DISABLED" && (
                              <div className="flex flex-col items-center self-start rounded-2xl bg-white p-3">
                                <p className="text-[10px] font-black text-[#60786B]">
                                  PET ID QR
                                </p>

                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`/api/pets/${pet.id}/qr`}
                                  alt={`${pet.name}'s Pet ID QR`}
                                  className="mt-2 h-28 w-28 object-contain"
                                />

                                <a
                                  href={`/api/pets/${pet.id}/qr`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 rounded-lg border border-[#CDE6D5] px-3 py-2 text-center text-[10px] font-bold text-[#205D43]"
                                >
                                  Open QR ↗
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-3xl bg-[#FFF0DC] p-5">
                          <p className="text-sm font-black text-[#B96035]">
                            🏷️ No Pet ID yet
                          </p>

                          <p className="mt-2 text-xs text-[#60786B]">
                            Give your pet a permanent digital identity.
                          </p>

                          <button
                            type="button"
                            onClick={() => issuePetId(pet.id)}
                            disabled={issuingId === pet.id}
                            className="mt-4 rounded-xl bg-[#205D43] px-5 py-3 text-xs font-bold text-white disabled:opacity-50"
                          >
                            {issuingId === pet.id
                              ? "Issuing..."
                              : "Issue Pet ID"}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* BOTTOM BANNER */}
            <section className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-[#FFF0E2] p-7">
              <div>
                <h2 className="text-xl font-black">
                  More paws, more love! 🐾
                </h2>
                <p className="mt-2 text-sm text-[#60786B]">
                  Add another furry friend to your family.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="rounded-xl bg-[#205D43] px-6 py-3 text-sm font-bold text-white"
              >
                + Add Pet
              </button>
            </section>
          </>
        )}
      </div>

      {/* CELEBRATION POPUP */}
      {celebration && (
        <CelebrationPopup
          celebration={celebration}
          onClose={() => setCelebration(null)}
        />
      )}
    </main>
  );
}
