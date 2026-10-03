"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  packSize: string;
  imageUrl: string | null;
};

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  mrp: number;
  product: Product;
};

type Customer = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
};

type Address = {
  id: number;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
};

type Order = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  address: Address;
  items: OrderItem[];
};

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [admin, setAdmin] = useState<Admin | null>(null);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================================================
  // LOAD ORDERS
  // ==================================================

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Could not load orders."
        );

        return;
      }

      setOrders(data.orders || []);
      setAdmin(data.admin || null);
    } catch (error) {
      console.error(
        "Load admin orders error:",
        error
      );

      setError(
        "Something went wrong while loading orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // ==================================================
  // UPDATE ORDER STATUS
  // ==================================================

  async function updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ) {
    try {
      setUpdatingId(orderId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            "Could not update order status."
        );

        return;
      }

      setSuccess(
        data.message ||
          "Order status updated successfully."
      );

      // Update status immediately on screen
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
                updatedAt:
                  data.order?.updatedAt ||
                  order.updatedAt,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update order error:",
        error
      );

      setError(
        "Something went wrong while updating the order."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ==================================================
  // LOGOUT
  // ==================================================

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/admin/logout", {
        method: "POST",
      });

      window.location.href =
        "/admin/login";
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );

      setError("Could not logout.");
    } finally {
      setLoggingOut(false);
    }
  }

  // ==================================================
  // FORMAT DATE
  // ==================================================

  function formatDate(date: string) {
    return new Date(date).toLocaleString(
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
  // STATUS STYLE
  // ==================================================

  function statusStyle(
    status: OrderStatus
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
              href="/admin/rewards"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 md:block"
            >
              Paw Points
            </Link>

            <Link
              href="/"
              className="hidden text-sm font-semibold text-gray-600 hover:text-orange-600 lg:block"
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

      {/* ============================================ */}
      {/* CONTENT */}
      {/* ============================================ */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div>
          <p className="font-bold uppercase tracking-wide text-orange-600">
            M24 · ADMIN
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Order Management 📦
          </h1>

          <p className="mt-2 text-gray-500">
            View customer orders,
            payments, delivery details
            and update order status.
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
        {/* MESSAGES */}
        {/* ========================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4 font-semibold text-green-700">
            {success}
          </div>
        )}

        {/* ========================================== */}
        {/* SUMMARY */}
        {/* ========================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Shipped
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "SHIPPED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">
              Delivered
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "DELIVERED"
                ).length
              }
            </p>
          </div>

        </div>

        {/* ========================================== */}
        {/* TITLE + REFRESH */}
        {/* ========================================== */}

        <div className="mt-10 flex items-end justify-between gap-4">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              All Orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {orders.length} order
              {orders.length === 1
                ? ""
                : "s"}{" "}
              found
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>

        </div>

        {/* ========================================== */}
        {/* LOADING */}
        {/* ========================================== */}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-12 text-center">

            <div className="text-5xl">
              📦
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No orders yet
            </h3>

            <p className="mt-2 text-gray-500">
              Customer orders will
              appear here.
            </p>

          </div>
        ) : (
          <div className="mt-6 space-y-6">

            {/* ====================================== */}
            {/* ORDER CARDS */}
            {/* ====================================== */}

            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >

                {/* ORDER HEADER */}

                <div className="border-b border-gray-100 p-6">

                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                        Order #{order.orderNumber}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {order.customer.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                        {order.paymentMethod}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          order.paymentStatus ===
                          "PAID"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus ===
                                "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Payment{" "}
                        {
                          order.paymentStatus
                        }
                      </span>

                    </div>
                  </div>

                  {/* STATUS UPDATE */}

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">

                    <label className="text-sm font-bold text-slate-700">
                      Order Status:
                    </label>

                    <select
                      value={order.status}
                      disabled={
                        updatingId ===
                        order.id
                      }
                      onChange={(event) =>
                        updateOrderStatus(
                          order.id,
                          event.target
                            .value as OrderStatus
                        )
                      }
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-semibold text-slate-700 outline-none focus:border-orange-500 disabled:opacity-50"
                    >
                      {orderStatuses.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>

                    {updatingId ===
                      order.id && (
                      <span className="text-sm text-orange-600">
                        Updating...
                      </span>
                    )}

                  </div>
                </div>

                {/* ================================== */}
                {/* CUSTOMER + ADDRESS */}
                {/* ================================== */}

                <div className="grid gap-6 border-b border-gray-100 p-6 md:grid-cols-2">

                  {/* CUSTOMER */}

                  <div>
                    <h4 className="font-bold text-slate-900">
                      👤 Customer
                    </h4>

                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>
                          Name:
                        </strong>{" "}
                        {
                          order.customer
                            .name
                        }
                      </p>

                      <p>
                        <strong>
                          Mobile:
                        </strong>{" "}
                        {
                          order.customer
                            .mobile
                        }
                      </p>

                      <p>
                        <strong>
                          Email:
                        </strong>{" "}
                        {order.customer
                          .email ||
                          "Not provided"}
                      </p>

                      <p>
                        <strong>
                          Customer ID:
                        </strong>{" "}
                        #
                        {
                          order.customer
                            .id
                        }
                      </p>
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div>
                    <h4 className="font-bold text-slate-900">
                      📍 Delivery Address
                    </h4>

                    <div className="mt-3 text-sm leading-6 text-gray-600">
                      <p>
                        {
                          order.address
                            .address
                        }
                      </p>

                      {order.address
                        .landmark && (
                        <p>
                          Landmark:{" "}
                          {
                            order.address
                              .landmark
                          }
                        </p>
                      )}

                      <p>
                        {
                          order.address
                            .city
                        }
                        ,{" "}
                        {
                          order.address
                            .state
                        }
                      </p>

                      <p>
                        PIN:{" "}
                        {
                          order.address
                            .pincode
                        }
                      </p>
                    </div>
                  </div>

                </div>

                {/* ================================== */}
                {/* PRODUCTS */}
                {/* ================================== */}

                <div className="border-b border-gray-100 p-6">

                  <h4 className="font-bold text-slate-900">
                    🛒 Products
                  </h4>

                  <div className="mt-4 space-y-4">

                    {order.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 sm:flex-row sm:items-center"
                        >

                          {/* IMAGE */}

                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">

                            {item.product
                              .imageUrl ? (
                              <img
                                src={
                                  item.product
                                    .imageUrl
                                }
                                alt={
                                  item.product
                                    .name
                                }
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <span className="text-3xl">
                                🐾
                              </span>
                            )}

                          </div>

                          {/* PRODUCT INFO */}

                          <div className="flex-1">

                            <h5 className="font-bold text-slate-900">
                              {
                                item.product
                                  .name
                              }
                            </h5>

                            <p className="mt-1 text-sm text-gray-500">
                              {
                                item.product
                                  .brand
                              }{" "}
                              ·{" "}
                              {
                                item.product
                                  .packSize
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Product #
                              {
                                item.productId
                              }
                            </p>

                          </div>

                          {/* QUANTITY */}

                          <div className="text-sm">
                            <p className="text-gray-400">
                              Quantity
                            </p>

                            <p className="font-bold text-slate-800">
                              {
                                item.quantity
                              }
                            </p>
                          </div>

                          {/* PRICE */}

                          <div className="text-sm sm:text-right">
                            <p className="text-gray-400">
                              Price
                            </p>

                            <p className="font-bold text-slate-800">
                              ₹
                              {
                                item.price
                              }
                            </p>

                            {item.mrp >
                              item.price && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹
                                {
                                  item.mrp
                                }
                              </p>
                            )}
                          </div>

                          {/* ITEM TOTAL */}

                          <div className="text-sm sm:text-right">
                            <p className="text-gray-400">
                              Item Total
                            </p>

                            <p className="font-bold text-slate-900">
                              ₹
                              {(
                                item.price *
                                item.quantity
                              ).toFixed(
                                2
                              )}
                            </p>
                          </div>

                        </div>
                      )
                    )}

                  </div>
                </div>

                {/* ================================== */}
                {/* TOTALS */}
                {/* ================================== */}

                <div className="p-6">

                  <div className="ml-auto max-w-sm space-y-3">

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Subtotal
                      </span>

                      <span>
                        ₹
                        {order.subtotal.toFixed(
                          2
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Delivery
                      </span>

                      <span>
                        {order.deliveryCharge ===
                        0
                          ? "FREE"
                          : `₹${order.deliveryCharge.toFixed(
                              2
                            )}`}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3">

                      <div className="flex justify-between">

                        <span className="font-bold text-slate-900">
                          Total
                        </span>

                        <span className="text-xl font-bold text-orange-600">
                          ₹
                          {order.total.toFixed(
                            2
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  <p className="mt-5 text-xs text-gray-400">
                    Database Order ID: #
                    {order.id}
                  </p>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}