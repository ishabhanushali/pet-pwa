"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type PetID = {
  code: string;
  status: string;
  activatedAt: string | null;
};

type Pet = {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  gender: string | null;
  photoUrl: string | null;
  createdAt: string;
  petId: PetID | null;
};

type Customer = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  createdAt: string;
  pawPoints: number;
  orderCount: number;
  addressCount: number;
  petCount: number;
  pets: Pet[];
};

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [admin, setAdmin] =
    useState<Admin | null>(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [searching, setSearching] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD CUSTOMERS
  // ==================================================

  async function loadCustomers(
    searchText = ""
  ) {
    try {
      setError("");

      if (searchText) {
        setSearching(true);
      } else {
        setLoading(true);
      }

      const query =
        searchText.trim()
          ? `?search=${encodeURIComponent(
              searchText.trim()
            )}`
          : "";

      const response = await fetch(
        `/api/admin/customers${query}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/admin/login";

        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Could not load customers."
        );

        return;
      }

      setCustomers(
        data.customers || []
      );

      setAdmin(
        data.admin || null
      );
    } catch (error) {
      console.error(
        "Load customers error:",
        error
      );

      setError(
        "Something went wrong while loading customers."
      );
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // ==================================================
  // SEARCH
  // ==================================================

  function handleSearch(
    event: FormEvent
  ) {
    event.preventDefault();

    loadCustomers(search);
  }

  // ==================================================
  // CLEAR SEARCH
  // ==================================================

  function clearSearch() {
    setSearch("");
    loadCustomers("");
  }

  // ==================================================
  // LOGOUT
  // ==================================================

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );

      window.location.href =
        "/admin/login";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setError(
        "Could not logout."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // ==================================================
  // DATE FORMAT
  // ==================================================

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* NAVBAR */}

      <nav className="border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

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

          <div className="flex items-center gap-3">

            <Link
              href="/admin/products"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 sm:block"
            >
              Products
            </Link>

            <Link
              href="/admin/rewards"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 sm:block"
            >
              Paw Points
            </Link>

            <Link
              href="/"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 sm:block"
            >
              Customer Site
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>

          </div>

        </div>

      </nav>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div>

          <p className="font-bold uppercase tracking-wide text-orange-600">
            M23 · ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Customers & Pets 👥🐾
          </h1>

          <p className="mt-2 text-gray-500">
            Search customers and view
            their pets, Pet IDs, orders
            and Paw Points.
          </p>

          {admin && (

            <p className="mt-2 text-sm text-gray-400">
              Logged in as{" "}
              <span className="font-semibold">
                {admin.name}
              </span>
            </p>

          )}

        </div>

        {/* ========================================== */}
        {/* SEARCH */}
        {/* ========================================== */}

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, mobile, email, pet name or Pet ID..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {searching
                ? "Searching..."
                : "🔍 Search"}
            </button>

            {search && (

              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-gray-300 px-5 py-3 font-bold text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>

            )}

          </form>

        </div>

        {/* ERROR */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-600">
            {error}
          </div>

        )}

        {/* ========================================== */}
        {/* CUSTOMER COUNT */}
        {/* ========================================== */}

        <div className="mt-8 flex items-end justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              Customers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {customers.length}{" "}
              customer
              {customers.length === 1
                ? ""
                : "s"}{" "}
              found
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              loadCustomers(search)
            }
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>

        </div>

        {/* ========================================== */}
        {/* LOADING */}
        {/* ========================================== */}

        {loading ? (

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Loading customers...
          </div>

        ) : customers.length === 0 ? (

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-12 text-center">

            <div className="text-5xl">
              🔎
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No customers found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another customer name,
              mobile number, email,
              pet name or Pet ID.
            </p>

          </div>

        ) : (

          /* ======================================== */
          /* CUSTOMER CARDS */
          /* ======================================== */

          <div className="mt-6 space-y-6">

            {customers.map(
              (customer) => (

                <div
                  key={customer.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* CUSTOMER HEADER */}

                  <div className="border-b border-gray-100 p-6">

                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                          Customer #
                          {customer.id}
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-slate-900">
                          {customer.name}
                        </h3>

                        <div className="mt-3 space-y-1 text-sm text-gray-500">

                          <p>
                            📱{" "}
                            {
                              customer.mobile
                            }
                          </p>

                          <p>
                            ✉️{" "}
                            {customer.email ||
                              "No email"}
                          </p>

                          <p>
                            📅 Joined{" "}
                            {formatDate(
                              customer.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                      {/* CUSTOMER STATS */}

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                        <div className="rounded-2xl bg-orange-50 p-4 text-center">

                          <p className="text-2xl font-bold text-orange-700">
                            {
                              customer.pawPoints
                            }
                          </p>

                          <p className="mt-1 text-xs font-semibold text-orange-600">
                            Paw Points
                          </p>

                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4 text-center">

                          <p className="text-2xl font-bold text-slate-800">
                            {
                              customer.petCount
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Pets
                          </p>

                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4 text-center">

                          <p className="text-2xl font-bold text-slate-800">
                            {
                              customer.orderCount
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Orders
                          </p>

                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4 text-center">

                          <p className="text-2xl font-bold text-slate-800">
                            {
                              customer.addressCount
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Addresses
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* ================================= */}
                  {/* PETS */}
                  {/* ================================= */}

                  <div className="p-6">

                    <h4 className="text-lg font-bold text-slate-900">
                      Pets
                    </h4>

                    {customer.pets.length ===
                    0 ? (

                      <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                        This customer has
                        not created a pet
                        profile yet.
                      </div>

                    ) : (

                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {customer.pets.map(
                          (pet) => (

                            <div
                              key={
                                pet.id
                              }
                              className="rounded-2xl border border-gray-200 p-5"
                            >

                              {/* PET TOP */}

                              <div className="flex items-center gap-4">

                                {pet.photoUrl ? (

                                  <img
                                    src={
                                      pet.photoUrl
                                    }
                                    alt={
                                      pet.name
                                    }
                                    className="h-16 w-16 rounded-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl">
                                    🐾
                                  </div>

                                )}

                                <div>

                                  <h5 className="text-lg font-bold text-slate-900">
                                    {
                                      pet.name
                                    }
                                  </h5>

                                  <p className="text-sm text-gray-500">
                                    {
                                      pet.type
                                    }

                                    {pet.breed
                                      ? ` · ${pet.breed}`
                                      : ""}
                                  </p>

                                </div>

                              </div>

                              {/* PET DETAILS */}

                              <div className="mt-5 space-y-3">

                                <div>

                                  <p className="text-xs text-gray-400">
                                    Pet Database ID
                                  </p>

                                  <p className="font-semibold text-slate-700">
                                    #
                                    {
                                      pet.id
                                    }
                                  </p>

                                </div>

                                {pet.gender && (

                                  <div>

                                    <p className="text-xs text-gray-400">
                                      Gender
                                    </p>

                                    <p className="font-semibold text-slate-700">
                                      {
                                        pet.gender
                                      }
                                    </p>

                                  </div>

                                )}

                                {/* PET ID */}

                                <div className="rounded-xl bg-gray-50 p-4">

                                  <p className="text-xs text-gray-400">
                                    Permanent
                                    Pet ID
                                  </p>

                                  {pet.petId ? (

                                    <>
                                      <p className="mt-1 text-lg font-bold text-slate-900">
                                        {
                                          pet.petId
                                            .code
                                        }
                                      </p>

                                      <span
                                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                                          pet.petId
                                            .status ===
                                          "ACTIVE"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                      >
                                        {
                                          pet.petId
                                            .status
                                        }
                                      </span>

                                      {pet.petId
                                        .activatedAt && (

                                        <p className="mt-2 text-xs text-gray-400">
                                          Activated{" "}
                                          {formatDate(
                                            pet.petId
                                              .activatedAt
                                          )}
                                        </p>

                                      )}

                                    </>

                                  ) : (

                                    <p className="mt-1 font-semibold text-gray-500">
                                      Not issued
                                    </p>

                                  )}

                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}