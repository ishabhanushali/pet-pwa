"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "../../components/CartProvider";

export default function CartPage() {
  const router = useRouter();

  const {
    cartItems,
    cartCount,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  // ====================================================
  // DELIVERY
  // ====================================================

  const deliveryCharge =
    cartTotal === 0 || cartTotal >= 499 ? 0 : 49;

  const finalTotal =
    cartTotal + deliveryCharge;

  // ====================================================
  // CHECKOUT + ANALYTICS
  // ====================================================

  async function handleCheckout() {
    if (
      cartItems.length === 0 ||
      checkoutLoading
    ) {
      return;
    }

    try {
      setCheckoutLoading(true);

      // Record checkout analytics.
      //
      // Do not send private information such as:
      // mobile number, address, OTP, session token, etc.
      //
      // If analytics fails, checkout will still continue.

      const response = await fetch(
        "/api/analytics",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            eventName:
              "CHECKOUT_STARTED",

            entityType: "CART",

            metadata: {
              itemCount: cartCount,
              subtotal: cartTotal,
              deliveryCharge,
              finalTotal,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Could not record CHECKOUT_STARTED analytics."
        );
      }
    } catch (error) {
      console.error(
        "Checkout analytics error:",
        error
      );
    } finally {
      // Analytics must never block checkout.

      router.push("/checkout");
    }
  }

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      {/* =================================================
          NAVBAR
      ================================================= */}

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

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="font-semibold text-gray-700 hover:text-orange-600"
            >
              Continue Shopping
            </Link>

            <div className="relative rounded-full bg-orange-50 px-4 py-2 text-xl">
              🛒

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="font-semibold text-orange-600">
            YOUR CART
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            Shopping Cart
          </h2>

          <p className="mt-2 text-gray-600">
            {cartCount === 0
              ? "Your cart is currently empty."
              : `${cartCount} ${
                  cartCount === 1
                    ? "item"
                    : "items"
                } in your cart`}
          </p>
        </div>
      </section>

      {/* =================================================
          EMPTY CART
      ================================================= */}

      {cartItems.length === 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="text-7xl">
              🛒
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              Your cart is empty
            </h3>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Looks like you haven&apos;t
              added anything for your furry
              friend yet.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-block rounded-full bg-orange-500 px-7 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      ) : (
        /* ===============================================
           CART CONTENT
        =============================================== */

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_380px]">
          {/* =============================================
              LEFT SIDE
          ============================================= */}

          <div>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center"
                >
                  {/* IMAGE */}

                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-6xl">
                    {item.image || "🐾"}
                  </div>

                  {/* PRODUCT */}

                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                      {item.brand}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.packSize}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-900">
                        ₹{item.price}
                      </span>

                      {item.mrp >
                        item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{item.mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QUANTITY */}

                  <div>
                    <p className="mb-2 text-center text-xs font-semibold text-gray-500">
                      Quantity
                    </p>

                    <div className="flex items-center rounded-xl border border-gray-200">
                      {/* DECREASE */}

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                        className="px-4 py-2 text-xl font-bold hover:bg-gray-100"
                      >
                        −
                      </button>

                      {/* CURRENT QUANTITY */}

                      <span className="min-w-10 text-center font-semibold">
                        {item.quantity}
                      </span>

                      {/* INCREASE */}

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                        className="px-4 py-2 text-xl font-bold hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* ITEM TOTAL */}

                  <div className="min-w-24 text-right">
                    <p className="text-xs text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      ₹
                      {item.price *
                        item.quantity}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                      className="mt-3 text-sm font-semibold text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ===========================================
                BOTTOM BUTTONS
            =========================================== */}

            <div className="mt-6 flex flex-wrap justify-between gap-4">
              <Link
                href="/shop"
                className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                ← Continue Shopping
              </Link>

              <button
                type="button"
                onClick={clearCart}
                className="rounded-full px-6 py-3 font-semibold text-red-500 hover:bg-red-50"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* =============================================
              ORDER SUMMARY
          ============================================= */}

          <div>
            <div className="sticky top-6 rounded-3xl border border-gray-200 bg-white p-6">
              <h3 className="text-2xl font-bold text-slate-900">
                Order Summary
              </h3>

              <div className="mt-6 space-y-4">
                {/* SUBTOTAL */}

                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    ₹{cartTotal}
                  </span>
                </div>

                {/* DELIVERY */}

                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery
                  </span>

                  <span>
                    {deliveryCharge ===
                    0
                      ? "FREE"
                      : `₹${deliveryCharge}`}
                  </span>
                </div>

                {/* FREE DELIVERY MESSAGE */}

                {cartTotal > 0 &&
                  cartTotal < 499 && (
                    <div className="rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
                      Add ₹
                      {499 -
                        cartTotal}{" "}
                      more for FREE
                      delivery.
                    </div>
                  )}

                {/* FINAL TOTAL */}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-slate-900">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* =========================================
                  PROCEED TO CHECKOUT
              ========================================= */}

              <button
                type="button"
                onClick={
                  handleCheckout
                }
                disabled={
                  checkoutLoading
                }
                className="mt-7 block w-full rounded-xl bg-orange-500 px-6 py-4 text-center font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading
                  ? "Opening Checkout..."
                  : "Proceed to Checkout →"}
              </button>

              <div className="mt-5 text-center">
                <p className="text-xs text-gray-400">
                  🔒 Secure checkout
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 bg-slate-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 md:flex-row">
          <div>
            <h3 className="text-xl font-bold">
              🐾 Pet PWA
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Better care for every pet.
            </p>
          </div>

          <p className="text-sm text-gray-400">
            © 2026 Pet PWA. All
            rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}