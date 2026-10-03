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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const [petId, setPetId] = useState("");
  const [title, setTitle] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==================================================
  // LOAD REMINDERS
  // ==================================================

  async function loadReminders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/reminders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Could not load reminders."
        );
        return;
      }

      setReminders(data.reminders || []);
    } catch (error) {
      console.error("Load reminders error:", error);

      setError("Could not load reminders.");
    } finally {
      setLoading(false);
    }
  }

  // ==================================================
  // LOAD PETS
  // ==================================================

  async function loadPets() {
    try {
      const response = await fetch("/api/pets", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Could not load pets:",
          data.message
        );
        return;
      }

      const petList = Array.isArray(data)
        ? data
        : data.pets || [];

      setPets(petList);
    } catch (error) {
      console.error("Load pets error:", error);
    }
  }

  useEffect(() => {
    loadReminders();
    loadPets();
  }, []);

  // ==================================================
  // CREATE REMINDER
  // ==================================================

  async function createReminder(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setCreating(true);
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

      const selectedDate =
        new Date(reminderAt);

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate.getTime() <= Date.now()
      ) {
        setError(
          "Please select a future date and time."
        );
        return;
      }

      const response = await fetch(
        "/api/reminders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            petId: petId || null,
            title: title.trim(),

            // Send an ISO timestamp so the server
            // receives an unambiguous date/time.
            reminderAt:
              selectedDate.toISOString(),

            note: note.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not create reminder."
        );
        return;
      }

      setMessage(
        "Reminder created successfully! 🔔"
      );

      // Clear form
      setPetId("");
      setTitle("");
      setReminderAt("");
      setNote("");

      // Reload list
      await loadReminders();
    } catch (error) {
      console.error(
        "Create reminder error:",
        error
      );

      setError(
        "Something went wrong while creating the reminder."
      );
    } finally {
      setCreating(false);
    }
  }

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
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* NAVBAR */}

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

          <div className="flex flex-wrap items-center gap-4">

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
              href="/rewards"
              className="font-semibold text-gray-600 hover:text-orange-600"
            >
              Rewards
            </Link>

          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        {/* HEADER */}

        <div className="mb-8">

          <p className="font-bold uppercase tracking-wide text-orange-600">
            MY ACCOUNT
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            🔔 Pet Reminders
          </h1>

          <p className="mt-2 text-gray-500">
            Create simple reminders for pet food,
            litter, treats, medicines, appointments,
            or anything else your pet needs.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">

            <p className="font-semibold text-red-600">
              {error}
            </p>

            {error
              .toLowerCase()
              .includes("login") && (
              <Link
                href="/login"
                className="mt-3 inline-block font-bold text-red-600 underline"
              >
                Go to Login
              </Link>
            )}

          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-5">

            <p className="font-semibold text-green-700">
              {message}
            </p>

          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          {/* ====================================== */}
          {/* CREATE REMINDER */}
          {/* ====================================== */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="text-4xl">
              🔔
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Create Reminder
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set a date and time for something you
              want to remember.
            </p>

            <form
              onSubmit={createReminder}
              className="mt-7 space-y-5"
            >

              {/* PET */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Pet
                </label>

                <select
                  value={petId}
                  onChange={(event) =>
                    setPetId(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
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
                    No pets found. You can still
                    create a general reminder.
                  </p>
                )}

              </div>

              {/* TITLE */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Reminder *
                </label>

                <input
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Example: Buy dog food"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Date & Time *
                </label>

                <input
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(event) =>
                    setReminderAt(
                      event.target.value
                    )
                  }
                  required
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

              {/* NOTE */}

              <div>

                <label className="block text-sm font-bold text-slate-700">
                  Note
                </label>

                <textarea
                  value={note}
                  maxLength={500}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="Example: Buy the 3kg pack"
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {note.length}/500
                </p>

              </div>

              {/* SUBMIT */}

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

          {/* ====================================== */}
          {/* REMINDERS LIST */}
          {/* ====================================== */}

          <div>

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Upcoming Reminders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your saved reminders appear here.
                </p>
              </div>

              <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                {
                  reminders.filter(
                    (reminder) =>
                      !reminder.completed
                  ).length
                }{" "}
                Active
              </div>

            </div>

            {/* LOADING */}

            {loading && (
              <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">

                <div className="text-5xl">
                  ⏳
                </div>

                <p className="mt-4 font-semibold text-gray-500">
                  Loading reminders...
                </p>

              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              reminders.length === 0 && (

              <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center">

                <div className="text-6xl">
                  🔔
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No reminders yet
                </h3>

                <p className="mt-2 text-gray-500">
                  Create your first reminder using
                  the form.
                </p>

              </div>

            )}

            {/* REMINDER CARDS */}

            {!loading &&
              reminders.length > 0 && (

              <div className="space-y-4">

                {reminders.map(
                  (reminder) => (

                    <div
                      key={reminder.id}
                      className={`rounded-3xl border bg-white p-6 shadow-sm ${
                        reminder.completed
                          ? "border-gray-200 opacity-60"
                          : "border-orange-100"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 gap-4">

                          {/* PET ICON */}

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                            {reminder.pet
                              ? "🐾"
                              : "🔔"}
                          </div>

                          <div className="min-w-0">

                            {/* PET */}

                            {reminder.pet && (
                              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                                {
                                  reminder.pet
                                    .name
                                }{" "}
                                •{" "}
                                {
                                  reminder.pet
                                    .type
                                }
                              </p>
                            )}

                            {!reminder.pet && (
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                GENERAL REMINDER
                              </p>
                            )}

                            {/* TITLE */}

                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {reminder.title}
                            </h3>

                            {/* DATE */}

                            <p className="mt-2 text-sm font-semibold text-gray-600">
                              📅{" "}
                              {formatDate(
                                reminder.reminderAt
                              )}
                            </p>

                            {/* NOTE */}

                            {reminder.note && (
                              <p className="mt-3 text-sm leading-6 text-gray-500">
                                {reminder.note}
                              </p>
                            )}

                          </div>

                        </div>

                        {/* STATUS */}

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
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

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}