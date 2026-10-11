
"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

type Pet = {
  id: number;
  name: string;
  type: string;
  photoUrl: string | null;
};

type Reminder = {
  id: number;
  title: string;
  reminderAt: string;
  note: string | null;
  completed: boolean;
  createdAt: string;
  pet: Pet | null;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-[#DCE8DA] bg-white px-4 py-3.5 text-[#245C46] outline-none transition focus:border-[#245C46] focus:ring-2 focus:ring-[#E3F1DF]";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "My Pets", href: "/pets" },
  { label: "Orders", href: "/orders" },
  { label: "Rewards", href: "/rewards" },
  { label: "Reminders", href: "/reminders" },
];

function Navbar() {
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        const profile =
          data.customer ?? data.profile ?? data;

        if (
          active &&
          typeof profile?.name === "string"
        ) {
          setName(profile.name);
        }
      } catch (error) {
        console.error("Profile error:", error);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const firstName = name.trim().split(/\s+/)[0];

  return (
    <>
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🐾 A little reminder goes a long way! 💚
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#E7ECE5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🐾</span>

            <div>
              <h1 className="text-xl font-black text-[#245C46]">
                Pet PWA
              </h1>

              <p className="text-xs text-[#819287]">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition hover:text-[#E77B49] ${
                  link.href === "/reminders"
                    ? "text-[#E77B49]"
                    : "text-[#486357]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-bold text-[#245C46]"
            >
              {name
                ? `👋 Hi, ${firstName}`
                : "👤 Profile"}
            </Link>

            <Link
              href="/cart"
              className="rounded-full bg-[#FFF0E4] px-3 py-2 text-xl"
              aria-label="Shopping cart"
            >
              🛒
            </Link>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto border-t border-[#F0F1EA] px-5 py-3 text-sm font-semibold lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 ${
                link.href === "/reminders"
                  ? "text-[#E77B49]"
                  : "text-[#536A5D]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getApiMessage(
  data: unknown,
  fallback: string
) {
  if (data && typeof data === "object") {
    const result = data as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof result.message === "string") {
      return result.message;
    }

    if (typeof result.error === "string") {
      return result.error;
    }
  }

  return fallback;
}

function getReminderEmoji(title: string) {
  const text = title.toLowerCase();

  if (/food|feed|meal|eat/.test(text)) {
    return "🍖";
  }

  if (/medicine|medication|tablet|dose/.test(text)) {
    return "💊";
  }

  if (/vaccine|vaccination/.test(text)) {
    return "💉";
  }

  if (/groom|bath|wash/.test(text)) {
    return "🛁";
  }

  if (/vet|doctor|appointment/.test(text)) {
    return "🩺";
  }

  if (/walk|exercise|play/.test(text)) {
    return "🐕";
  }

  return "🔔";
}

export default function RemindersPage() {
  const [reminders, setReminders] =
    useState<Reminder[]>([]);

  const [pets, setPets] = useState<Pet[]>([]);

  const [petId, setPetId] = useState("");
  const [title, setTitle] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [authRequired, setAuthRequired] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReminders(
    showLoader = true
  ) {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const response = await fetch(
        "/api/reminders",
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const data = await response.json();

      const apiMessage = getApiMessage(
        data,
        "Could not load reminders."
      );

      if (
        response.status === 401 ||
        response.status === 403 ||
        (!response.ok &&
          /log\s*in|login|sign\s*in|unauthori[sz]ed/i.test(
            apiMessage
          ))
      ) {
        setAuthRequired(true);
        setReminders([]);
        return;
      }

      if (!response.ok) {
        setError(apiMessage);
        return;
      }

      setAuthRequired(false);

      const reminderList = Array.isArray(data)
        ? data
        : data.reminders;

      setReminders(
        Array.isArray(reminderList)
          ? reminderList
          : []
      );
    } catch (err) {
      console.error(
        "Load reminders error:",
        err
      );

      setError(
        "Could not load reminders. Please try again."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  async function loadPets() {
    try {
      const response = await fetch(
        "/api/pets",
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      const petList = Array.isArray(data)
        ? data
        : data.pets;

      setPets(
        Array.isArray(petList)
          ? petList
          : []
      );
    } catch (err) {
      console.error("Load pets error:", err);
    }
  }

  useEffect(() => {
    void loadReminders();
    void loadPets();
  }, []);

  async function createReminder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (title.trim().length < 2) {
      setError(
        "Please enter a reminder title."
      );
      return;
    }

    if (!reminderAt) {
      setError(
        "Please select a reminder date and time."
      );
      return;
    }

    const selectedDate = new Date(reminderAt);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getTime() <= Date.now()
    ) {
      setError(
        "Please select a future date and time."
      );
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        "/api/reminders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            petId: petId || null,
            title: title.trim(),
            reminderAt:
              selectedDate.toISOString(),
            note: note.trim(),
          }),
        }
      );

      const data = await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setAuthRequired(true);
        return;
      }

      if (!response.ok) {
        setError(
          getApiMessage(
            data,
            "Could not create reminder."
          )
        );
        return;
      }

      setPetId("");
      setTitle("");
      setReminderAt("");
      setNote("");

      await loadReminders(false);

      setMessage(
        "Your reminder has been created successfully! 🔔"
      );
    } catch (err) {
      console.error(
        "Create reminder error:",
        err
      );

      setError(
        "Something went wrong while creating the reminder."
      );
    } finally {
      setCreating(false);
    }
  }

  const activeCount = reminders.filter(
    (reminder) => !reminder.completed
  ).length;

  const completedCount =
    reminders.length - activeCount;

  return (
    <main className="min-h-screen bg-[#FFFCF7] text-[#245C46]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#FFF2E6]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#FFE0C9]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#E3F1DF]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:py-16">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-[#D97748] shadow-sm">
              🐾 LITTLE MOMENTS MATTER
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Never miss a{" "}
              <span className="text-[#E98557]">
                paw-some moment!
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#688071]">
              Feeding time, vet visits, grooming
              days and everything in between.
              Keep your furry friend's routine
              happy and organized! 💚
            </p>

            <a
              href="#create-reminder"
              className="mt-6 inline-flex rounded-full bg-[#245C46] px-7 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              Create a Reminder 🔔
            </a>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex h-40 w-52 items-center justify-center sm:h-48 sm:w-64"
          >
            <div className="absolute h-40 w-40 rounded-full bg-[#F9DFC9] sm:h-48 sm:w-48" />

            <span className="relative text-7xl sm:text-8xl">
              🐶
            </span>

            <span className="absolute -right-2 top-2 text-4xl">
              🔔
            </span>

            <span className="absolute bottom-0 left-0 text-4xl">
              🐾
            </span>

            <span className="absolute bottom-2 right-2 text-3xl">
              ✨
            </span>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="flex min-h-[50vh] items-center justify-center px-5">
          <div className="text-center">
            <div className="animate-bounce text-6xl">
              🔔
            </div>

            <p className="mt-5 font-bold text-[#708476]">
              Fetching your little reminders...
            </p>
          </div>
        </section>
      ) : authRequired ? (
        /* LOGIN REQUIRED */
        <section className="mx-auto max-w-3xl px-5 py-14">
          <div className="rounded-[32px] border border-[#E3EAE0] bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
              🔔
            </div>

            <p className="mt-6 text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
              PET CARE MADE SIMPLE
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Your pet's routine awaits!
            </h2>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-[#708476]">
              Log in to create reminders for
              feeding, medicines, vaccinations,
              grooming and vet appointments.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login?next=%2Freminders"
                className="rounded-full bg-[#245C46] px-7 py-3.5 font-bold text-white"
              >
                Login to Reminders
              </Link>

              <Link
                href="/signup?next=%2Freminders"
                className="rounded-full border border-[#C9DEC9] bg-[#EAF5E9] px-7 py-3.5 font-bold text-[#245C46]"
              >
                Create Account
              </Link>
            </div>

            <Link
              href="/"
              className="mt-7 inline-block text-sm font-bold text-[#D97748]"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          {/* PAGE HEADING */}
          <div className="mb-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E98557]">
              💚 YOUR PET CARE PLANNER
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Little reminders, big love
            </h2>

            <p className="mt-2 text-sm text-[#708476]">
              All your pet care plans in one happy place.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-[#EAF5E9] p-5">
              <span className="text-3xl">🔔</span>
              <p className="mt-3 text-3xl font-black">
                {activeCount}
              </p>
              <p className="mt-1 text-sm font-bold text-[#66806C]">
                Active Reminders
              </p>
            </div>

            <div className="rounded-[24px] bg-[#FFF0E4] p-5">
              <span className="text-3xl">✨</span>
              <p className="mt-3 text-3xl font-black">
                {completedCount}
              </p>
              <p className="mt-1 text-sm font-bold text-[#9A7866]">
                Completed
              </p>
            </div>

            <div className="rounded-[24px] bg-[#F2EDFA] p-5">
              <span className="text-3xl">🐾</span>
              <p className="mt-3 text-3xl font-black">
                {pets.length}
              </p>
              <p className="mt-1 text-sm font-bold text-[#827295]">
                My Pets
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-semibold text-green-700"
            >
              {message}
            </div>
          )}

          <div className="grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            {/* CREATE REMINDER */}
            <div
              id="create-reminder"
              className="scroll-mt-32 overflow-hidden rounded-[30px] border border-[#E3EAE0] bg-white shadow-sm"
            >
              <div className="bg-[#EAF5E9] px-6 py-6 sm:px-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl">
                    🔔
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Create Reminder
                    </h2>

                    <p className="mt-1 text-sm text-[#708476]">
                      Plan something special for your pet.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={createReminder}
                className="space-y-5 p-6 sm:p-7"
              >
                {/* PET */}
                <div>
                  <label
                    htmlFor="reminder-pet"
                    className="block text-sm font-extrabold"
                  >
                    🐾 Choose Your Pet
                  </label>

                  <select
                    id="reminder-pet"
                    value={petId}
                    onChange={(event) =>
                      setPetId(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      General Reminder
                    </option>

                    {pets.map((pet) => (
                      <option
                        key={pet.id}
                        value={pet.id}
                      >
                        {pet.name} ({pet.type})
                      </option>
                    ))}
                  </select>

                  {pets.length === 0 && (
                    <p className="mt-2 text-xs text-[#819287]">
                      No pets added yet. You can still
                      create a general reminder.
                    </p>
                  )}
                </div>

                {/* TITLE */}
                <div>
                  <label
                    htmlFor="reminder-title"
                    className="block text-sm font-extrabold"
                  >
                    ✨ What should we remember? *
                  </label>

                  <input
                    id="reminder-title"
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Bruno's vet appointment"
                    className={inputClass}
                  />
                </div>

                {/* DATE */}
                <div>
                  <label
                    htmlFor="reminder-date"
                    className="block text-sm font-extrabold"
                  >
                    📅 Date & Time *
                  </label>

                  <input
                    id="reminder-date"
                    type="datetime-local"
                    required
                    value={reminderAt}
                    onChange={(event) =>
                      setReminderAt(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* NOTE */}
                <div>
                  <label
                    htmlFor="reminder-note"
                    className="block text-sm font-extrabold"
                  >
                    📝 Extra Notes
                  </label>

                  <textarea
                    id="reminder-note"
                    rows={3}
                    maxLength={500}
                    value={note}
                    onChange={(event) =>
                      setNote(event.target.value)
                    }
                    placeholder="Add any extra details..."
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-2 text-right text-xs text-[#819287]">
                    {note.length}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-full bg-[#245C46] px-6 py-4 font-extrabold text-white transition hover:bg-[#194633] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating Reminder..."
                    : "🔔 Save My Reminder"}
                </button>

                <p className="text-center text-xs leading-5 text-[#819287]">
                  Your reminder will be saved
                  to your account.
                </p>
              </form>
            </div>

            {/* REMINDER LIST */}
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
                    🐾 YOUR LITTLE PLANS
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    My Reminders
                  </h2>

                  <p className="mt-2 text-sm text-[#708476]">
                    Every important moment, all in one place.
                  </p>
                </div>

                <span className="rounded-full bg-[#EAF5E9] px-4 py-2 text-sm font-extrabold text-[#245C46]">
                  🔔 {activeCount} Active
                </span>
              </div>

              {reminders.length === 0 ? (
                <div className="rounded-[30px] border border-[#E3EAE0] bg-white px-6 py-14 text-center shadow-sm">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
                    🐶
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    No reminders yet!
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#708476]">
                    Create your first reminder
                    and keep your furry friend's
                    routine on track.
                  </p>

                  <a
                    href="#create-reminder"
                    className="mt-6 inline-flex rounded-full bg-[#245C46] px-6 py-3 text-sm font-extrabold text-white"
                  >
                    Create My First Reminder 🔔
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((reminder, index) => {
                    const background =
                      [
                        "bg-[#EAF5E9]",
                        "bg-[#FFF0E4]",
                        "bg-[#F2EDFA]",
                        "bg-[#FFF4D9]",
                      ][index % 4];

                    return (
                      <article
                        key={reminder.id}
                        className={`overflow-hidden rounded-[26px] border border-[#E3EAE0] bg-white shadow-sm transition hover:shadow-md ${
                          reminder.completed
                            ? "opacity-75"
                            : ""
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <div
                              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${background}`}
                            >
                              {getReminderEmoji(
                                reminder.title
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
                                {reminder.pet
                                  ? `${reminder.pet.name} • ${reminder.pet.type}`
                                  : "General Reminder"}
                              </p>

                              <h3 className="mt-2 break-words text-lg font-black">
                                {reminder.title}
                              </h3>

                              <p className="mt-3 text-sm font-semibold text-[#668071]">
                                📅{" "}
                                {formatDate(
                                  reminder.reminderAt
                                )}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-2 text-xs font-extrabold ${
                              reminder.completed
                                ? "bg-[#DCF5E3] text-[#216947]"
                                : "bg-[#FFF3C6] text-[#956400]"
                            }`}
                          >
                            {reminder.completed
                              ? "✓ Completed"
                              : "⏳ Upcoming"}
                          </span>
                        </div>

                        {reminder.note && (
                          <div className="border-t border-[#EDF0EA] bg-[#FFFCF7] px-5 py-4 sm:px-6">
                            <p className="break-words text-sm leading-6 text-[#708476]">
                              📝 {reminder.note}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM CARD */}
          <div className="mt-10 rounded-[30px] bg-[#EAF5E9] p-7 sm:p-9">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
                  💚 MORE HAPPY PET MOMENTS
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Your pet deserves all the love!
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#708476]">
                  Keep your pet profiles updated
                  and make caring for them even easier.
                </p>
              </div>

              <Link
                href="/pets"
                className="shrink-0 rounded-full bg-[#245C46] px-7 py-3 text-sm font-extrabold text-white"
              >
                View My Pets 🐾
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#E6EBE2] bg-[#F3F7EF] py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 sm:flex-row sm:items-center">
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
