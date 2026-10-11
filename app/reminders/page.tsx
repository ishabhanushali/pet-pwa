
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

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
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

function Navbar() {
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

        <div className="flex flex-wrap items-center gap-5 text-sm">
          <Link href="/shop" className="font-semibold text-gray-600 hover:text-orange-600">
            Shop
          </Link>
          <Link href="/pets" className="font-semibold text-gray-600 hover:text-orange-600">
            Pets
          </Link>
          <Link href="/orders" className="font-semibold text-gray-600 hover:text-orange-600">
            Orders
          </Link>
          <Link href="/rewards" className="font-semibold text-gray-600 hover:text-orange-600">
            Rewards
          </Link>
          <Link href="/profile" className="font-semibold text-gray-600 hover:text-orange-600">
            Profile
          </Link>
        </div>
      </div>
    </nav>
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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const [petId, setPetId] = useState("");
  const [title, setTitle] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadReminders(
    showLoader = true
  ) {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const response = await fetch("/api/reminders", {
        cache: "no-store",
        credentials: "same-origin",
      });

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
      console.error("Load reminders error:", err);
      setError(
        "Could not load reminders. Please try again."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  async function loadPets() {
    try {
      const response = await fetch("/api/pets", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) return;

      const data = await response.json();

      const petList = Array.isArray(data)
        ? data
        : data.pets;

      setPets(
        Array.isArray(petList) ? petList : []
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
      setError("Please enter a reminder title.");
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

      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          petId: petId || null,
          title: title.trim(),
          reminderAt: selectedDate.toISOString(),
          note: note.trim(),
        }),
      });

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
      console.error("Create reminder error:", err);
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

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <Navbar />

      {loading ? (
        <section className="flex min-h-[65vh] items-center justify-center px-5">
          <div className="text-center">
            <div className="text-5xl">🔔</div>
            <p className="mt-4 font-semibold text-gray-500">
              Loading your reminders...
            </p>
          </div>
        </section>
      ) : authRequired ? (
        // LOGGED-OUT VIEW
        <section className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-5xl">
              🔔
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-orange-600">
              PET CARE MADE SIMPLE
            </p>

            <h1 className="mx-auto mt-3 max-w-lg text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Never Miss a Moment of Pet Care!
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-gray-600">
              Log in or create an account to set
              reminders for feeding, medicines,
              vaccinations, grooming and vet
              appointments. Keep your pet&apos;s
              routine organized in one place.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?next=%2Freminders"
                className="rounded-xl bg-orange-500 px-8 py-3.5 font-bold text-white transition hover:bg-orange-600"
              >
                Login to Reminders
              </Link>

              <Link
                href="/signup?next=%2Freminders"
                className="rounded-xl border border-orange-500 bg-white px-8 py-3.5 font-bold text-orange-600 transition hover:bg-orange-50"
              >
                Create Account
              </Link>
            </div>

            <p className="mt-7 text-sm text-gray-500">
              🐾 A little reminder goes a long way.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block text-sm font-semibold text-orange-600 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </section>
      ) : (
        // LOGGED-IN VIEW
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
          {/* PAGE HEADER */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
              MY ACCOUNT
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              🔔 Pet Reminders
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Stay on top of your pet&apos;s daily
              routine, from mealtimes to important
              vet appointments.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600"
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
            >
              {message}
            </div>
          )}

          <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            {/* CREATE REMINDER */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                  🔔
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Create Reminder
                  </h2>
                  <p className="text-sm text-gray-500">
                    Plan something important for your pet.
                  </p>
                </div>
              </div>

              <form
                onSubmit={createReminder}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="reminder-pet"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Pet
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
                      General reminder
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
                    <p className="mt-2 text-xs text-gray-400">
                      No pets added yet. You can still
                      create a general reminder.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reminder-title"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Reminder *
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
                    placeholder="e.g. Buy dog food"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="reminder-date"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Date & Time *
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

                <div>
                  <label
                    htmlFor="reminder-note"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Note
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

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {note.length}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "🔔 Create Reminder"}
                </button>
              </form>
            </div>

            {/* UPCOMING REMINDERS */}
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Upcoming Reminders
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your saved reminders, all in one place.
                  </p>
                </div>

                <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                  {activeCount} Active
                </span>
              </div>

              {reminders.length === 0 ? (
                <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                  <div className="text-5xl">🔔</div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    No reminders yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                    Create your first reminder and
                    keep your pet&apos;s routine on track.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <article
                      key={reminder.id}
                      className={`rounded-2xl border bg-white p-5 shadow-sm ${
                        reminder.completed
                          ? "border-gray-200 opacity-70"
                          : "border-orange-100"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                            {reminder.pet
                              ? "🐾"
                              : "🔔"}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                              {reminder.pet
                                ? `${reminder.pet.name} • ${reminder.pet.type}`
                                : "General Reminder"}
                            </p>

                            <h3 className="mt-1 break-words text-lg font-bold text-slate-900">
                              {reminder.title}
                            </h3>

                            <p className="mt-2 text-sm font-medium text-gray-600">
                              📅{" "}
                              {formatDate(
                                reminder.reminderAt
                              )}
                            </p>

                            {reminder.note && (
                              <p className="mt-3 break-words text-sm leading-6 text-gray-500">
                                {reminder.note}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            reminder.completed
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {reminder.completed
                            ? "Completed"
                            : "Upcoming"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
