"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type RecentOrder = {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;

  customer: {
    id: number;
    name: string;
    mobile: string;
  };
};

type TopProduct = {
  productId: number;
  name: string;
  brand: string;
  packSize: string;
  quantitySold: number;
};

type Analytics = {
  customers: {
    total: number;
  };

  products: {
    total: number;
    available: number;
    unavailable: number;
    totalStock: number;
  };

  pets: {
    total: number;
  };

  petIDs: {
    total: number;
    active: number;
    inactive: number;
  };

  orders: {
    total: number;
    pending: number;
    confirmed: number;
    packed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };

  revenue: {
    total: number;
  };

  pawPoints: {
    credited: number;
    debited: number;
    balance: number;
  };

  recentOrders: RecentOrder[];

  topProducts: TopProduct[];
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [admin, setAdmin] =
    useState<Admin | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // LOAD ANALYTICS
  // ==================================================

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/analytics",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href =
          "/admin/login";

        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Could not load analytics."
        );

        return;
      }

      setAnalytics(
        data.analytics || null
      );

      setAdmin(
        data.admin || null
      );
    } catch (error) {
      console.error(
        "Load analytics error:",
        error
      );

      setError(
        "Something went wrong while loading analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

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
  // DATE
  // ==================================================

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // ==================================================
  // CURRENCY
  // ==================================================

  function formatCurrency(
    value: number
  ) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(value);
  }

  // ==================================================
  // STATUS STYLE
  // ==================================================

  function statusStyle(
    status: string
  ) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PACKED":
        return "bg-purple-100 text-purple-700";

      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7]">

        <div className="text-center">

          <div className="text-5xl">
            📊
          </div>

          <p className="mt-4 font-semibold text-gray-500">
            Loading analytics...
          </p>

        </div>

      </main>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* ============================================ */}
      {/* NAVBAR */}
      {/* ============================================ */}

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
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 md:block"
            >
              Products
            </Link>

            <Link
              href="/admin/customers"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 md:block"
            >
              Customers
            </Link>

            <Link
              href="/admin/orders"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 md:block"
            >
              Orders
            </Link>

            <Link
              href="/admin/rewards"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 lg:block"
            >
              Paw Points
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

      {/* ============================================ */}
      {/* CONTENT */}
      {/* ============================================ */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-bold uppercase tracking-wide text-orange-600">
              M25 · ADMIN
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Analytics Dashboard 📊
            </h1>

            <p className="mt-2 text-gray-500">
              Overview of customers,
              orders, products, pets,
              revenue and Paw Points.
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

          <button
            type="button"
            onClick={loadAnalytics}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            🔄 Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-600">
            {error}
          </div>

        )}

        {!analytics ? (

          <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-12 text-center">

            <div className="text-5xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Analytics unavailable
            </h2>

            <button
              type="button"
              onClick={loadAnalytics}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Try Again
            </button>

          </div>

        ) : (

          <>
            {/* ====================================== */}
            {/* MAIN STAT CARDS */}
            {/* ====================================== */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="text-3xl">
                  👥
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Customers
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {
                    analytics
                      .customers.total
                  }
                </p>

              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="text-3xl">
                  📦
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Orders
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {
                    analytics
                      .orders.total
                  }
                </p>

              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="text-3xl">
                  🐾
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Pets
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {
                    analytics
                      .pets.total
                  }
                </p>

              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="text-3xl">
                  💰
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Delivered Revenue
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  {formatCurrency(
                    analytics
                      .revenue.total
                  )}
                </p>

              </div>

            </div>

            {/* ====================================== */}
            {/* ORDER STATUS */}
            {/* ====================================== */}

            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    Order Status
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Current order
                    pipeline.
                  </p>

                </div>

                <Link
                  href="/admin/orders"
                  className="text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  Manage Orders →
                </Link>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">

                <StatusCard
                  label="Pending"
                  value={
                    analytics.orders
                      .pending
                  }
                  className="bg-yellow-50 text-yellow-700"
                />

                <StatusCard
                  label="Confirmed"
                  value={
                    analytics.orders
                      .confirmed
                  }
                  className="bg-blue-50 text-blue-700"
                />

                <StatusCard
                  label="Packed"
                  value={
                    analytics.orders
                      .packed
                  }
                  className="bg-purple-50 text-purple-700"
                />

                <StatusCard
                  label="Shipped"
                  value={
                    analytics.orders
                      .shipped
                  }
                  className="bg-indigo-50 text-indigo-700"
                />

                <StatusCard
                  label="Delivered"
                  value={
                    analytics.orders
                      .delivered
                  }
                  className="bg-green-50 text-green-700"
                />

                <StatusCard
                  label="Cancelled"
                  value={
                    analytics.orders
                      .cancelled
                  }
                  className="bg-red-50 text-red-700"
                />

              </div>

            </div>

            {/* ====================================== */}
            {/* PRODUCTS / PET IDs / PAW POINTS */}
            {/* ====================================== */}

            <div className="mt-8 grid gap-6 lg:grid-cols-3">

              {/* PRODUCTS */}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <h2 className="text-xl font-bold text-slate-900">
                    🛍️ Products
                  </h2>

                  <Link
                    href="/admin/products"
                    className="text-xs font-bold text-orange-600"
                  >
                    Manage →
                  </Link>

                </div>

                <div className="mt-6 space-y-4">

                  <InfoRow
                    label="Total Products"
                    value={
                      analytics.products
                        .total
                    }
                  />

                  <InfoRow
                    label="Available"
                    value={
                      analytics.products
                        .available
                    }
                  />

                  <InfoRow
                    label="Unavailable"
                    value={
                      analytics.products
                        .unavailable
                    }
                  />

                  <InfoRow
                    label="Total Units in Stock"
                    value={
                      analytics.products
                        .totalStock
                    }
                  />

                </div>

              </div>

              {/* PET IDs */}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-bold text-slate-900">
                  🪪 Pet IDs
                </h2>

                <div className="mt-6 space-y-4">

                  <InfoRow
                    label="Total Pets"
                    value={
                      analytics.pets
                        .total
                    }
                  />

                  <InfoRow
                    label="Pet IDs Issued"
                    value={
                      analytics.petIDs
                        .total
                    }
                  />

                  <InfoRow
                    label="Active IDs"
                    value={
                      analytics.petIDs
                        .active
                    }
                  />

                  <InfoRow
                    label="Inactive IDs"
                    value={
                      analytics.petIDs
                        .inactive
                    }
                  />

                </div>

              </div>

              {/* PAW POINTS */}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <h2 className="text-xl font-bold text-slate-900">
                    🐾 Paw Points
                  </h2>

                  <Link
                    href="/admin/rewards"
                    className="text-xs font-bold text-orange-600"
                  >
                    Manage →
                  </Link>

                </div>

                <div className="mt-6 space-y-4">

                  <InfoRow
                    label="Points Credited"
                    value={
                      analytics.pawPoints
                        .credited
                    }
                  />

                  <InfoRow
                    label="Points Used"
                    value={
                      analytics.pawPoints
                        .debited
                    }
                  />

                  <div className="rounded-2xl bg-orange-50 p-4">

                    <p className="text-sm font-semibold text-orange-600">
                      Current Balance
                    </p>

                    <p className="mt-1 text-3xl font-bold text-orange-700">
                      {
                        analytics.pawPoints
                          .balance
                      }
                    </p>

                  </div>

                </div>

              </div>

            </div>
{/* ====================================== */}
{/* CSV EXPORTS */}
{/* ====================================== */}

<div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
  <div>
    <h2 className="text-2xl font-bold text-slate-900">
      📥 Export Data
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Download business data as CSV files.
    </p>
  </div>

  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

    {/* CUSTOMERS */}
    <a
      href="/api/admin/exports/customers"
      className="rounded-2xl border border-gray-200 p-5 transition hover:border-orange-300 hover:bg-orange-50"
    >
      <div className="text-3xl">👥</div>

      <h3 className="mt-3 font-bold text-slate-900">
        Customers
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Customer details, order counts and Paw Points.
      </p>

      <p className="mt-4 font-bold text-orange-600">
        Download CSV ↓
      </p>
    </a>

    {/* PETS */}
    <a
      href="/api/admin/exports/pets"
      className="rounded-2xl border border-gray-200 p-5 transition hover:border-orange-300 hover:bg-orange-50"
    >
      <div className="text-3xl">🐾</div>

      <h3 className="mt-3 font-bold text-slate-900">
        Pets
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Pet profiles, Pet IDs and owner details.
      </p>

      <p className="mt-4 font-bold text-orange-600">
        Download CSV ↓
      </p>
    </a>

    {/* ORDERS */}
    <a
      href="/api/admin/exports/orders"
      className="rounded-2xl border border-gray-200 p-5 transition hover:border-orange-300 hover:bg-orange-50"
    >
      <div className="text-3xl">📦</div>

      <h3 className="mt-3 font-bold text-slate-900">
        Orders
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Orders, payments and delivery details.
      </p>

      <p className="mt-4 font-bold text-orange-600">
        Download CSV ↓
      </p>
    </a>

    {/* PRODUCTS */}
    <a
      href="/api/admin/exports/products"
      className="rounded-2xl border border-gray-200 p-5 transition hover:border-orange-300 hover:bg-orange-50"
    >
      <div className="text-3xl">🛍️</div>

      <h3 className="mt-3 font-bold text-slate-900">
        Products
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Product catalogue, prices and stock.
      </p>

      <p className="mt-4 font-bold text-orange-600">
        Download CSV ↓
      </p>
    </a>

  </div>
</div>  
            {/* ====================================== */}
            {/* TOP PRODUCTS */}
            {/* ====================================== */}

            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-2xl font-bold text-slate-900">
                🏆 Top Selling Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Products ranked by
                quantity ordered.
              </p>

              {analytics.topProducts
                .length === 0 ? (

                <div className="mt-6 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
                  No product sales yet.
                </div>

              ) : (

                <div className="mt-6 space-y-3">

                  {analytics.topProducts.map(
                    (product, index) => (

                      <div
                        key={
                          product.productId
                        }
                        className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row sm:items-center"
                      >

                        <div className="flex items-center gap-4">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 font-bold text-orange-700">
                            #
                            {index + 1}
                          </div>

                          <div>

                            <h3 className="font-bold text-slate-900">
                              {
                                product.name
                              }
                            </h3>

                            <p className="text-sm text-gray-500">
                              {
                                product.brand
                              }

                              {product.packSize
                                ? ` · ${product.packSize}`
                                : ""}
                            </p>

                          </div>

                        </div>

                        <div className="text-left sm:text-right">

                          <p className="text-2xl font-bold text-slate-900">
                            {
                              product.quantitySold
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            units ordered
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            {/* ====================================== */}
            {/* RECENT ORDERS */}
            {/* ====================================== */}

            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    🕒 Recent Orders
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Latest five customer
                    orders.
                  </p>

                </div>

                <Link
                  href="/admin/orders"
                  className="text-sm font-bold text-orange-600"
                >
                  View All →
                </Link>

              </div>

              {analytics.recentOrders
                .length === 0 ? (

                <div className="mt-6 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
                  No orders yet.
                </div>

              ) : (

                <div className="mt-6 overflow-x-auto">

                  <table className="w-full min-w-[750px] text-left">

                    <thead>

                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">

                        <th className="px-3 py-3">
                          Order
                        </th>

                        <th className="px-3 py-3">
                          Customer
                        </th>

                        <th className="px-3 py-3">
                          Date
                        </th>

                        <th className="px-3 py-3">
                          Payment
                        </th>

                        <th className="px-3 py-3">
                          Status
                        </th>

                        <th className="px-3 py-3 text-right">
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {analytics.recentOrders.map(
                        (order) => (

                          <tr
                            key={order.id}
                            className="border-b border-gray-100 last:border-0"
                          >

                            <td className="px-3 py-4 font-bold text-slate-800">
                              #
                              {
                                order.orderNumber
                              }
                            </td>

                            <td className="px-3 py-4">

                              <p className="font-semibold text-slate-800">
                                {
                                  order.customer
                                    .name
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                {
                                  order.customer
                                    .mobile
                                }
                              </p>

                            </td>

                            <td className="px-3 py-4 text-sm text-gray-500">
                              {formatDate(
                                order.createdAt
                              )}
                            </td>

                            <td className="px-3 py-4">

                              <p className="text-sm font-semibold text-slate-700">
                                {
                                  order.paymentMethod
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                {
                                  order.paymentStatus
                                }
                              </p>

                            </td>

                            <td className="px-3 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(
                                  order.status
                                )}`}
                              >
                                {
                                  order.status
                                }
                              </span>

                            </td>

                            <td className="px-3 py-4 text-right font-bold text-slate-900">
                              {formatCurrency(
                                order.total
                              )}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>

        )}

      </section>

    </main>
  );
}

// ====================================================
// SMALL COMPONENT - STATUS CARD
// ====================================================

function StatusCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
    >
      <p className="text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {label}
      </p>
    </div>
  );
}

// ====================================================
// SMALL COMPONENT - INFO ROW
// ====================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}