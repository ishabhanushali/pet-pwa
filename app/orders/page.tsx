
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../../components/CartProvider";
import type { Product } from "../../components/CartProvider";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  mrp: number;
  product: {
    id: number;
    name: string;
    brand: string;
    category: string;
    packSize: string;
    image: string;
  };
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
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentMethod: "COD" | "ONLINE";
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";
  createdAt: string;
  address: Address;
  items: OrderItem[];
};

type ApiProduct = Product & {
  stock?: number;
};

type Customer = {
  id: number;
  name: string;
};

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "My Pets", href: "/pets" },
  { label: "Orders", href: "/orders" },
  { label: "Rewards", href: "/rewards" },
];

function OrdersNavbar() {
  const [customer, setCustomer] =
    useState<Customer | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { cartCount } = useCart();

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
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
          setCustomer({
            id: profile.id,
            name: profile.name,
          });
        }
      } catch (error) {
        console.error("Customer error:", error);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    void loadCustomer();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setCustomer(null);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      setLogoutError("Could not log out. Try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  const firstName =
    customer?.name.trim().split(/\s+/)[0] || "";

  return (
    <>
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🐾 Every little order brings big tail wags! 💚
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#E9EDE5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <div>
              <h1 className="text-xl font-extrabold text-[#245C46]">
                Pet PWA
              </h1>
              <p className="text-xs text-[#819287]">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold transition hover:text-[#E77B49] ${
                  item.href === "/orders"
                    ? "text-[#E77B49]"
                    : "text-[#486357]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {authLoading ? (
              <span className="text-xs text-[#819287]">
                Loading...
              </span>
            ) : customer ? (
              <>
                <Link
                  href="/profile"
                  title={customer.name}
                  className="max-w-32 truncate rounded-full bg-[#E8F5E9] px-3 py-2 text-xs font-bold text-[#245C46] sm:max-w-44 sm:px-4 sm:text-sm"
                >
                  👋 Hi, {firstName}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-full border border-[#F6D7CB] px-3 py-2 text-xs font-bold text-[#D46F4C] hover:bg-[#FFF0E9] disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  {loggingOut ? "..." : "Logout"}
                </button>
              </>
            ) : (
              <Link
                href="/login?next=%2Forders"
                className="rounded-full bg-[#245C46] px-4 py-2 text-sm font-bold text-white"
              >
                Login
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className="relative rounded-full bg-[#FFF0E4] px-3 py-2 text-xl"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF8756] px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto border-t border-[#F0F1EA] px-5 py-3 text-sm font-semibold lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 ${
                item.href === "/orders"
                  ? "text-[#E77B49]"
                  : "text-[#536A5D]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {logoutError && (
          <p role="alert" className="px-6 pb-3 text-sm text-red-600">
            {logoutError}
          </p>
        )}
      </nav>
    </>
  );
}

function getStatusStyle(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-[#FFF3C6] text-[#956400]";
    case "CONFIRMED":
      return "bg-[#E2F1FF] text-[#28618A]";
    case "PACKED":
      return "bg-[#F0E8FF] text-[#7150A0]";
    case "SHIPPED":
      return "bg-[#E7E9FF] text-[#4E5A9E]";
    case "DELIVERED":
      return "bg-[#DCF5E3] text-[#216947]";
    case "CANCELLED":
      return "bg-[#FFE5E5] text-[#AC4242]";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPaymentStyle(status: Order["paymentStatus"]) {
  switch (status) {
    case "PAID":
      return "bg-[#DCF5E3] text-[#216947]";
    case "PENDING":
      return "bg-[#FFF3C6] text-[#956400]";
    case "FAILED":
      return "bg-[#FFE5E5] text-[#AC4242]";
    case "REFUNDED":
      return "bg-[#E2F1FF] text-[#28618A]";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusEmoji(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "⏳";
    case "CONFIRMED":
      return "💚";
    case "PACKED":
      return "🎁";
    case "SHIPPED":
      return "🚚";
    case "DELIVERED":
      return "🎉";
    case "CANCELLED":
      return "❌";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatPrice(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

export default function OrdersPage() {
  const router = useRouter();
  const { addToCart, getQuantity } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");

  const [reorderingOrderId, setReorderingOrderId] =
    useState<number | null>(null);

  const [reorderMessage, setReorderMessage] =
    useState("");
  const [reorderError, setReorderError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/orders", {
          method: "GET",
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
            /login|log in|sign in|unauthori[sz]ed/i.test(
              message
            ))
        ) {
          if (active) {
            setAuthRequired(true);
            setOrders([]);
          }
          return;
        }

        if (!response.ok) {
          if (active) {
            setError(
              message || "Could not load your orders."
            );
          }
          return;
        }

        if (active) {
          setAuthRequired(false);
          setOrders(
            Array.isArray(data)
              ? data
              : Array.isArray(data.orders)
                ? data.orders
                : []
          );
        }
      } catch (err) {
        console.error("Load orders error:", err);

        if (active) {
          setError(
            "Could not load your orders. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  // Reorder using current products, prices and stock.
  async function handleReorder(order: Order) {
    try {
      setReorderingOrderId(order.id);
      setReorderError("");
      setReorderMessage("");

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setReorderError(
          data.message ||
            "Could not check current product availability."
        );
        return;
      }

      const currentProducts: ApiProduct[] =
        Array.isArray(data)
          ? data
          : data.products || [];

      let addedItemCount = 0;
      const skippedItems: string[] = [];

      for (const oldItem of order.items) {
        const currentProduct = currentProducts.find(
          (product) =>
            product.id === oldItem.product.id
        );

        if (!currentProduct) {
          skippedItems.push(
            `${oldItem.product.name} is no longer available`
          );
          continue;
        }

        if (!currentProduct.inStock) {
          skippedItems.push(
            `${currentProduct.name} is out of stock`
          );
          continue;
        }

        const currentCartQuantity = getQuantity(
          currentProduct.id
        );

        let quantityToAdd = oldItem.quantity;

        if (typeof currentProduct.stock === "number") {
          const remainingStock =
            currentProduct.stock - currentCartQuantity;

          if (remainingStock <= 0) {
            skippedItems.push(
              `${currentProduct.name} has no more stock available`
            );
            continue;
          }

          quantityToAdd = Math.min(
            oldItem.quantity,
            remainingStock
          );

          if (quantityToAdd < oldItem.quantity) {
            skippedItems.push(
              `${currentProduct.name}: only ${quantityToAdd} of ${oldItem.quantity} could be added`
            );
          }
        }

        for (let i = 0; i < quantityToAdd; i++) {
          addToCart(currentProduct);
          addedItemCount++;
        }
      }

      if (addedItemCount === 0) {
        setReorderError(
          skippedItems.length > 0
            ? `Nothing was added. ${skippedItems.join(". ")}.`
            : "No products from this order are currently available."
        );
        return;
      }

      if (skippedItems.length > 0) {
        setReorderMessage(
          `${addedItemCount} item(s) added to your cart. Some items were skipped: ${skippedItems.join(". ")}.`
        );
      } else {
        setReorderMessage(
          `${addedItemCount} item(s) added to your cart using current prices.`
        );
      }

      router.push("/cart");
    } catch (err) {
      console.error("Reorder error:", err);
      setReorderError(
        "Something went wrong while reordering."
      );
    } finally {
      setReorderingOrderId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFCF7] text-[#193D32]">
      <OrdersNavbar />

      {/* PLAYFUL HERO */}
      <section className="relative overflow-hidden bg-[#FFF2E6]">
        <div className="pointer-events-none absolute -left-14 -top-20 h-52 w-52 rounded-full bg-[#FFE2CA]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#E3F1DF]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-5 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:py-16">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-[#D97748] shadow-sm">
              🐾 YOUR HAPPY PAW JOURNEY
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-[#245C46] sm:text-5xl">
              Your paw-some{" "}
              <span className="text-[#E98557]">
                orders!
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#688071]">
              Every little package brings big happiness.
              Check your orders, follow their journey,
              or bring home your favorites again! 💚
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#245C46] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              Explore More Goodies 🛍️
            </Link>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex h-40 w-52 items-center justify-center sm:h-48 sm:w-64"
          >
            <div className="absolute h-40 w-40 rounded-full bg-[#F9DFC9] sm:h-48 sm:w-48" />
            <span className="relative rotate-[-10deg] text-7xl drop-shadow-lg sm:text-8xl">
              📦
            </span>
            <span className="absolute -right-2 top-1 text-4xl">
              🐾
            </span>
            <span className="absolute bottom-1 left-0 text-4xl">
              🦴
            </span>
            <span className="absolute bottom-2 right-1 text-3xl">
              ✨
            </span>
          </div>
        </div>
      </section>

      {/* ORDER CONTENT */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        {loading ? (
          <div className="rounded-[28px] bg-[#EAF5E9] px-6 py-20 text-center">
            <div className="animate-bounce text-6xl">
              📦
            </div>
            <p className="mt-5 font-bold text-[#245C46]">
              Fetching your happy packages...
            </p>
          </div>
        ) : authRequired ? (
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E5EDE2] bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF0E4] text-6xl">
              🐶
            </div>

            <h2 className="mt-7 text-3xl font-black text-[#245C46]">
              Your orders are waiting!
            </h2>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-[#708476]">
              Sign in to see your order history,
              delivery details, payment status and
              favorite goodies.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login?next=%2Forders"
                className="rounded-full bg-[#245C46] px-7 py-3.5 font-bold text-white"
              >
                Login to My Orders
              </Link>

              <Link
                href="/signup?next=%2Forders"
                className="rounded-full border border-[#C9DEC9] bg-[#EAF5E9] px-7 py-3.5 font-bold text-[#245C46]"
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E98557]">
                  💚 YOUR ORDER HISTORY
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#245C46] sm:text-3xl">
                  My little deliveries
                </h2>
              </div>

              {!error && (
                <span className="rounded-full bg-[#EAF5E9] px-4 py-2 text-xs font-bold text-[#245C46]">
                  📦 {orders.length}{" "}
                  {orders.length === 1
                    ? "order"
                    : "orders"}
                </span>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-600"
              >
                {error}
              </div>
            )}

            {reorderError && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-600"
              >
                {reorderError}
              </div>
            )}

            {reorderMessage && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 font-semibold text-green-700"
              >
                {reorderMessage}
              </div>
            )}

            {/* EMPTY STATE */}
            {!error && orders.length === 0 && (
              <div className="rounded-[32px] border border-[#E3EAE0] bg-white px-6 py-16 text-center shadow-sm">
                <div className="text-7xl">🛍️</div>

                <h3 className="mt-5 text-2xl font-black text-[#245C46]">
                  No orders yet, little paw!
                </h3>

                <p className="mt-3 text-[#708476]">
                  Your first bundle of happiness is
                  just a few clicks away.
                </p>

                <Link
                  href="/shop"
                  className="mt-7 inline-flex rounded-full bg-[#245C46] px-7 py-3 font-bold text-white"
                >
                  Let's Go Shopping 🐾
                </Link>
              </div>
            )}

            {/* ORDER CARDS */}
            {!error && orders.length > 0 && (
              <div className="space-y-7">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-[30px] border border-[#E5EAE1] bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* ORDER HEADER */}
                    <div className="border-b border-[#E2EBDF] bg-[#EAF5E9] px-5 py-5 sm:px-7">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold uppercase tracking-wider text-[#6B9177]">
                            🐾 Order number
                          </p>

                          <p className="mt-1 break-all text-base font-black text-[#245C46]">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-sm text-[#708476]">
                            📅 {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-2 text-xs font-extrabold ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {getStatusEmoji(order.status)}{" "}
                            {order.status}
                          </span>

                          <span
                            className={`rounded-full px-3 py-2 text-xs font-extrabold ${getPaymentStyle(
                              order.paymentStatus
                            )}`}
                          >
                            💳 Payment:{" "}
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PRODUCTS */}
                    <div className="px-5 py-6 sm:px-7">
                      <h3 className="text-lg font-black text-[#245C46]">
                        🎁 Goodies in this order
                      </h3>

                      <div className="mt-4 divide-y divide-[#EDF0EA]">
                        {order.items.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 py-4 first:pt-0 sm:gap-5"
                          >
                            <div
                              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl sm:h-20 sm:w-20 sm:text-4xl ${
                                [
                                  "bg-[#FFF0E4]",
                                  "bg-[#EAF5E9]",
                                  "bg-[#F3EDFA]",
                                  "bg-[#FFF4D9]",
                                ][index % 4]
                              }`}
                            >
                              {item.product.image || "🐾"}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-extrabold leading-snug text-[#245C46]">
                                {item.product.name}
                              </p>

                              <p className="mt-1 text-xs text-[#718478] sm:text-sm">
                                {item.product.brand} •{" "}
                                {item.product.packSize}
                              </p>

                              <span className="mt-2 inline-flex rounded-full bg-[#F3F6EF] px-3 py-1 text-xs font-bold text-[#64806E]">
                                Qty: {item.quantity}
                              </span>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-sm font-black text-[#245C46] sm:text-base">
                                {formatPrice(
                                  item.price * item.quantity
                                )}
                              </p>

                              <p className="mt-1 text-xs text-[#91A096]">
                                {formatPrice(item.price)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ADDRESS AND PAYMENT */}
                    <div className="grid gap-4 border-t border-[#EDF0EA] px-5 py-6 sm:px-7 md:grid-cols-2">
                      <div className="rounded-2xl bg-[#FFF5E9] p-5">
                        <p className="font-extrabold text-[#245C46]">
                          📍 Delivery address
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#63786B]">
                          {order.address.address}
                        </p>

                        {order.address.landmark && (
                          <p className="text-sm leading-6 text-[#63786B]">
                            Landmark:{" "}
                            {order.address.landmark}
                          </p>
                        )}

                        <p className="text-sm leading-6 text-[#63786B]">
                          {order.address.city},{" "}
                          {order.address.state} -{" "}
                          {order.address.pincode}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#F1EDF9] p-5">
                        <p className="font-extrabold text-[#245C46]">
                          💳 Payment details
                        </p>

                        <p className="mt-3 text-sm text-[#63786B]">
                          {order.paymentMethod === "COD"
                            ? "Cash on Delivery"
                            : "Online Payment"}
                        </p>

                        <p className="mt-2 text-sm text-[#63786B]">
                          Status:{" "}
                          <span className="font-bold">
                            {order.paymentStatus}
                          </span>
                        </p>

                        {order.paymentMethod === "ONLINE" && (
                          <p className="mt-2 text-xs text-[#8B8A98]">
                            Development mock payment
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ORDER TOTALS */}
                    <div className="border-t border-[#EDF0EA] bg-[#FFFAF2] px-5 py-6 sm:px-7">
                      <div className="ml-auto max-w-sm space-y-3">
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-[#708476]">
                            Subtotal
                          </span>

                          <span className="font-bold text-[#245C46]">
                            {formatPrice(order.subtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-[#708476]">
                            Delivery
                          </span>

                          <span className="font-bold text-[#245C46]">
                            {order.deliveryCharge === 0
                              ? "FREE 🎉"
                              : formatPrice(
                                  order.deliveryCharge
                                )}
                          </span>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-[#EEDFCF] pt-3">
                          <span className="font-black text-[#245C46]">
                            Order Total
                          </span>

                          <span className="text-xl font-black text-[#D97748]">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* REORDER */}
                    <div className="flex flex-col justify-between gap-4 border-t border-[#EDF0EA] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                      <div>
                        <p className="font-extrabold text-[#245C46]">
                          Loved these goodies? 🐶
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#718478]">
                          Reorder favorites using today's
                          prices and availability.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleReorder(order)
                        }
                        disabled={reorderingOrderId !== null}
                        className="rounded-full bg-[#245C46] px-7 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {reorderingOrderId === order.id
                          ? "Adding to Cart..."
                          : "🔄 Reorder Goodies"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* SUPPORT */}
      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
        <div className="flex flex-col justify-between gap-5 rounded-[30px] bg-[#E8F4E8] p-7 sm:p-9 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
              🐾 WE'RE HERE TO HELP
            </p>

            <h3 className="mt-2 text-2xl font-black text-[#245C46]">
              Questions about your order?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#708476]">
              We're happy to help with your little
              one's goodies.
            </p>
          </div>

          <Link
            href="/support"
            className="shrink-0 rounded-full bg-[#245C46] px-7 py-3 text-center text-sm font-extrabold text-white"
          >
            Let's Chat 💬
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E6EBE2] bg-[#F3F7EF] py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 md:flex-row md:items-center">
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
