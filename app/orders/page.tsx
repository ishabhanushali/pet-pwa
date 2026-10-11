
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Product,
  useCart,
} from "../../components/CartProvider";

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

function OrdersNavbar() {
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

        <div className="flex flex-wrap items-center gap-5">
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

function getStatusStyle(status: Order["status"]) {
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

function getPaymentStyle(status: Order["paymentStatus"]) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "REFUNDED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
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

  // LOAD ORDERS
  useEffect(() => {
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

        // Unauthenticated customers see a friendly
        // login screen instead of a red error banner.
        if (
          response.status === 401 ||
          response.status === 403 ||
          (!response.ok &&
            /login|log in|sign in|unauthori[sz]ed/i.test(
              message
            ))
        ) {
          setAuthRequired(true);
          setOrders([]);
          return;
        }

        if (!response.ok) {
          setError(
            message || "Could not load your orders."
          );
          return;
        }

        setAuthRequired(false);
        setOrders(
          Array.isArray(data)
            ? data
            : Array.isArray(data.orders)
              ? data.orders
              : []
        );
      } catch (err) {
        console.error("Load orders error:", err);

        setError(
          "Could not load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // REORDER PREVIOUS PRODUCTS
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

        // Add current products at their current prices.
        for (let i = 0; i < quantityToAdd; i++) {
          addToCart(currentProduct);
          addedItemCount++;
        }
      }

      if (addedItemCount === 0) {
        setReorderError(
          skippedItems.length > 0
            ? `Nothing was added. ${skippedItems.join(
                ". "
              )}.`
            : "No products from this order are currently available."
        );
        return;
      }

      if (skippedItems.length > 0) {
        setReorderMessage(
          `${addedItemCount} item(s) added to your cart. Some items were skipped: ${skippedItems.join(
            ". "
          )}.`
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

  // LOADING
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7]">
        <div className="text-center">
          <div className="text-6xl">📦</div>
          <p className="mt-4 font-semibold text-gray-600">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  // LOGIN REQUIRED SCREEN
  if (authRequired) {
    return (
      <main className="min-h-screen bg-[#fafaf7]">
        <OrdersNavbar />

        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-6xl">
              📦
            </div>

            <h1 className="mt-7 text-3xl font-bold text-slate-900">
              Your Orders Are Waiting!
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-gray-600">
              Log in or create an account to view
              your order history, track order status,
              check delivery details and quickly
              reorder your favourite pet essentials.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/login?next=%2Forders"
                className="rounded-xl bg-orange-500 px-8 py-3.5 font-bold text-white transition hover:bg-orange-600"
              >
                Login to My Orders
              </Link>

              <Link
                href="/signup?next=%2Forders"
                className="rounded-xl border border-orange-500 bg-white px-8 py-3.5 font-bold text-orange-600 transition hover:bg-orange-50"
              >
                Create Account
              </Link>
            </div>

            <p className="mt-7 text-sm text-gray-500">
              🐾 Your orders will appear here
              once you&apos;re signed in.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // MAIN ORDERS PAGE
  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <OrdersNavbar />

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="font-bold uppercase tracking-wide text-orange-600">
            MY ACCOUNT
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            My Orders
          </h1>

          <p className="mt-2 text-gray-500">
            View your order history, track status,
            and quickly reorder previous products.
          </p>
        </div>

        {/* API ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5"
          >
            <p className="font-semibold text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* REORDER ERROR */}
        {reorderError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5"
          >
            <p className="font-semibold text-red-600">
              {reorderError}
            </p>
          </div>
        )}

        {/* REORDER SUCCESS */}
        {reorderMessage && (
          <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="font-semibold text-green-700">
              {reorderMessage}
            </p>
          </div>
        )}

        {/* NO ORDERS */}
        {!error && orders.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="text-6xl">📦</div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your orders will appear here after
              you make your first purchase.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* ORDER HISTORY */}
        {!error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                {/* ORDER HEADER */}
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        Order Number
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPaymentStyle(
                          order.paymentStatus
                        )}`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="p-6">
                  <h3 className="font-bold text-slate-900">
                    Products
                  </h3>

                  <div className="mt-4 divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 first:pt-0"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
                          {item.product.image || "🐾"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">
                            {item.product.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.product.brand} •{" "}
                            {item.product.packSize}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {formatPrice(
                              item.price * item.quantity
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DELIVERY AND PAYMENT */}
                <div className="grid gap-6 border-t border-gray-100 px-6 py-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      📍 Delivery Address
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {order.address.address}
                    </p>

                    {order.address.landmark && (
                      <p className="text-sm text-gray-500">
                        Landmark: {order.address.landmark}
                      </p>
                    )}

                    <p className="text-sm text-gray-600">
                      {order.address.city},{" "}
                      {order.address.state} -{" "}
                      {order.address.pincode}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      💳 Payment
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>

                    {order.paymentMethod === "ONLINE" && (
                      <p className="mt-1 text-xs text-gray-400">
                        Development mock payment
                      </p>
                    )}
                  </div>
                </div>

                {/* TOTALS */}
                <div className="border-t border-gray-100 bg-orange-50 px-6 py-5">
                  <div className="ml-auto max-w-sm space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span className="font-semibold text-slate-700">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Delivery
                      </span>

                      <span className="font-semibold text-slate-700">
                        {order.deliveryCharge === 0
                          ? "FREE"
                          : formatPrice(
                              order.deliveryCharge
                            )}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-orange-200 pt-3">
                      <span className="font-bold text-slate-900">
                        Total
                      </span>

                      <span className="text-xl font-bold text-orange-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* REORDER */}
                <div className="border-t border-gray-100 bg-white px-6 py-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-bold text-slate-900">
                        Buy these items again
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Current prices and availability
                        will be used.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleReorder(order)
                      }
                      disabled={
                        reorderingOrderId === order.id
                      }
                      className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reorderingOrderId === order.id
                        ? "Adding to Cart..."
                        : "🔄 Reorder"}
                    </button>
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
