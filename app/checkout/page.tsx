"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../../components/CartProvider";

type Address = {
  id: number;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

type Customer = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
};

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<"COD" | "ONLINE">("COD");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const [completedPaymentMethod, setCompletedPaymentMethod] =
    useState<"COD" | "ONLINE" | null>(null);

  const deliveryCharge =
    cartTotal === 0 ? 0 : cartTotal >= 499 ? 0 : 49;

  const total = cartTotal + deliveryCharge;

  // ----------------------------------------------------
  // LOAD CUSTOMER + SAVED ADDRESSES
  // ----------------------------------------------------

  useEffect(() => {
    async function loadCheckout() {
      try {
        setLoading(true);
        setError("");

        // Load logged-in customer
        const profileResponse = await fetch("/api/profile", {
          cache: "no-store",
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
          setError(
            profileData.message ||
              "Please login before checkout."
          );

          return;
        }

        setCustomer(profileData.customer);

        // Load customer's addresses
        const addressResponse = await fetch("/api/addresses", {
          cache: "no-store",
        });

        const addressData = await addressResponse.json();

        if (!addressResponse.ok) {
          setError(
            addressData.message ||
              "Could not load delivery addresses."
          );

          return;
        }

        const loadedAddresses: Address[] =
          addressData.addresses || [];

        setAddresses(loadedAddresses);

        // Automatically select default address
        const defaultAddress = loadedAddresses.find(
          (item) => item.isDefault
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (loadedAddresses.length > 0) {
          setSelectedAddressId(loadedAddresses[0].id);
        }
      } catch (error) {
        console.error("Checkout loading error:", error);

        setError(
          "Could not load checkout. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, []);

  // ----------------------------------------------------
  // PLACE ORDER
  // ----------------------------------------------------

  async function placeOrder() {
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedAddressId) {
      setError("Please select a delivery address.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      // Send only product ID + quantity.
      // Server reads the real prices from PostgreSQL.
      const items = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      // ------------------------------------------------
      // CASH ON DELIVERY
      // ------------------------------------------------

      if (paymentMethod === "COD") {
        const response = await fetch("/api/orders", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            addressId: selectedAddressId,
            paymentMethod: "COD",
            items,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Could not place your order."
          );

          return;
        }

        setCompletedPaymentMethod("COD");
        setOrderNumber(data.order.orderNumber);

        // Clear cart only after successful order creation
        clearCart();

        return;
      }

      // ------------------------------------------------
      // MOCK ONLINE PAYMENT
      // DEVELOPMENT ONLY
      // ------------------------------------------------

      const paymentResponse = await fetch(
        "/api/payment/mock",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            addressId: selectedAddressId,
            items,

            // Development-only simulated successful payment
            simulateSuccess: true,
          }),
        }
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        setError(
          paymentData.message ||
            "Online payment failed. Please try again."
        );

        return;
      }

      setCompletedPaymentMethod("ONLINE");

      setOrderNumber(
        paymentData.order.orderNumber
      );

      // Clear cart only after successful mock payment
      clearCart();
    } catch (error) {
      console.error("Place order error:", error);

      setError(
        "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // ----------------------------------------------------
  // LOADING SCREEN
  // ----------------------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7]">
        <div className="text-center">
          <div className="text-6xl">🐾</div>

          <p className="mt-4 font-semibold text-gray-600">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // ORDER SUCCESS SCREEN
  // ----------------------------------------------------

  if (orderNumber) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafaf7] px-6">
        <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <div className="text-6xl">🎉</div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Order Placed!
          </h1>

          <p className="mt-3 text-gray-500">
            Your order has been created successfully.
          </p>

          <div className="mt-6 rounded-2xl bg-orange-50 p-5">

            <p className="text-sm text-gray-500">
              Order Number
            </p>

            <p className="mt-1 break-all text-xl font-bold text-orange-600">
              {orderNumber}
            </p>

          </div>

          {completedPaymentMethod === "ONLINE" && (
            <div className="mt-4 rounded-2xl bg-green-50 p-4">

              <p className="font-bold text-green-700">
                ✓ Mock Payment Successful
              </p>

              <p className="mt-1 text-sm text-green-600">
                Payment Status: PAID
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Development mode only — no real money was
                charged.
              </p>

            </div>
          )}

          {completedPaymentMethod === "COD" && (
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">

              <p className="font-bold text-blue-700">
                Cash on Delivery
              </p>

              <p className="mt-1 text-sm text-blue-600">
                Payment will be collected when your order
                arrives.
              </p>

            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link
              href="/shop"
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              Continue Shopping
            </Link>

            <Link
              href="/profile"
              className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-700 hover:bg-gray-50"
            >
              My Profile
            </Link>

          </div>

        </div>
      </main>
    );
  }

  // ----------------------------------------------------
  // MAIN CHECKOUT PAGE
  // ----------------------------------------------------

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

          <Link
            href="/cart"
            className="font-semibold text-gray-600 hover:text-orange-600"
          >
            ← Back to Cart
          </Link>

        </div>

      </nav>

      {/* CHECKOUT */}
      <section className="mx-auto max-w-6xl px-6 py-12">

        {/* HEADER */}
        <div className="mb-8">

          <p className="font-bold uppercase tracking-wide text-orange-600">
            CHECKOUT
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Complete your order
          </h1>

          {customer && (
            <p className="mt-2 text-gray-500">
              Ordering as{" "}
              <span className="font-semibold">
                {customer.name}
              </span>{" "}
              • +91 {customer.mobile}
            </p>
          )}

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 font-medium text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY CART */}
        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">

            <div className="text-6xl">
              🛒
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Add some products before checking out.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              Go to Shop
            </Link>

          </div>
        ) : (

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* LEFT SIDE */}
            <div className="space-y-6">

              {/* DELIVERY ADDRESS */}
              <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                  <div>

                    <h2 className="text-xl font-bold text-slate-900">
                      📍 Delivery Address
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Select where you want your order
                      delivered.
                    </p>

                  </div>

                  <Link
                    href="/profile"
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    + Add Address
                  </Link>

                </div>

                {/* NO ADDRESS */}
                {addresses.length === 0 ? (

                  <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 p-7 text-center">

                    <div className="text-4xl">
                      🏠
                    </div>

                    <p className="mt-3 font-bold text-slate-700">
                      No delivery address found
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Add an address before placing your
                      order.
                    </p>

                    <Link
                      href="/profile"
                      className="mt-4 inline-block rounded-xl bg-orange-500 px-5 py-2.5 font-bold text-white hover:bg-orange-600"
                    >
                      Add Address
                    </Link>

                  </div>

                ) : (

                  /* SAVED ADDRESSES */
                  <div className="mt-6 space-y-3">

                    {addresses.map((item) => (

                      <label
                        key={item.id}
                        className={`block cursor-pointer rounded-2xl border-2 p-5 transition ${
                          selectedAddressId === item.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >

                        <div className="flex items-start gap-3">

                          <input
                            type="radio"
                            name="address"
                            checked={
                              selectedAddressId === item.id
                            }
                            onChange={() =>
                              setSelectedAddressId(item.id)
                            }
                            className="mt-1"
                          />

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="font-bold text-slate-900">
                                Delivery Address
                              </p>

                              {item.isDefault && (
                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                                  Default
                                </span>
                              )}

                            </div>

                            <p className="mt-2 text-gray-600">
                              {item.address}
                            </p>

                            {item.landmark && (
                              <p className="mt-1 text-sm text-gray-500">
                                Landmark: {item.landmark}
                              </p>
                            )}

                            <p className="mt-1 text-gray-600">
                              {item.city}, {item.state} -{" "}
                              {item.pincode}
                            </p>

                          </div>

                        </div>

                      </label>

                    ))}

                  </div>

                )}

              </div>

              {/* PAYMENT METHOD */}
              <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

                <h2 className="text-xl font-bold text-slate-900">
                  💳 Payment Method
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to pay.
                </p>

                <div className="mt-6 space-y-3">

                  {/* COD */}
                  <label
                    className={`block cursor-pointer rounded-2xl border-2 p-5 transition ${
                      paymentMethod === "COD"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => {
                          setPaymentMethod("COD");
                          setError("");
                        }}
                      />

                      <div>

                        <p className="font-bold text-slate-900">
                          💵 Cash on Delivery
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Pay when your order arrives.
                        </p>

                      </div>

                    </div>

                  </label>

                  {/* ONLINE */}
                  <label
                    className={`block cursor-pointer rounded-2xl border-2 p-5 transition ${
                      paymentMethod === "ONLINE"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <input
                        type="radio"
                        name="payment"
                        checked={
                          paymentMethod === "ONLINE"
                        }
                        onChange={() => {
                          setPaymentMethod("ONLINE");
                          setError("");
                        }}
                        className="mt-1"
                      />

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-bold text-slate-900">
                            💳 Online Payment
                          </p>

                          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700">
                            DEMO
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          Simulated online payment for
                          development and testing.
                        </p>

                        <p className="mt-2 text-xs font-semibold text-orange-600">
                          No real money will be charged.
                        </p>

                      </div>

                    </div>

                  </label>

                </div>

              </div>

            </div>

            {/* RIGHT SIDE */}
            <div>

              <div className="sticky top-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-bold text-slate-900">
                  Order Summary
                </h2>

                {/* CART PRODUCTS */}
                <div className="mt-5 space-y-4">

                  {cartItems.map((item) => (

                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-gray-100 pb-4"
                    >

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-3xl">
                        {item.image || "🐾"}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold text-slate-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.packSize} × {item.quantity}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          ₹{item.price} each
                        </p>

                      </div>

                      <p className="font-bold text-slate-900">
                        ₹
                        {(
                          item.price * item.quantity
                        ).toFixed(2)}
                      </p>

                    </div>

                  ))}

                </div>

                {/* PRICE DETAILS */}
                <div className="mt-5 space-y-3 text-sm">

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹{cartTotal.toFixed(2)}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Delivery
                    </span>

                    <span className="font-semibold">

                      {deliveryCharge === 0
                        ? "FREE"
                        : `₹${deliveryCharge.toFixed(2)}`}

                    </span>

                  </div>

                  {deliveryCharge > 0 && (
                    <p className="text-xs text-gray-400">
                      Free delivery on orders of ₹499 or
                      more.
                    </p>
                  )}

                  <div className="border-t border-gray-200 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="text-lg font-bold text-slate-900">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-orange-600">
                        ₹{total.toFixed(2)}
                      </span>

                    </div>

                  </div>

                </div>

                {/* PLACE ORDER */}
                <button
                  onClick={placeOrder}
                  disabled={
                    placingOrder ||
                    addresses.length === 0 ||
                    !selectedAddressId
                  }
                  className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {placingOrder
                    ? paymentMethod === "ONLINE"
                      ? "Processing Payment..."
                      : "Placing Order..."
                    : paymentMethod === "ONLINE"
                      ? `Pay ₹${total.toFixed(2)}`
                      : "Place Order"}

                </button>

                {/* PAYMENT INFORMATION */}
                {paymentMethod === "ONLINE" ? (

                  <div className="mt-4 rounded-xl bg-yellow-50 p-3 text-center">

                    <p className="text-xs font-semibold text-yellow-700">
                      🧪 Mock Payment Mode
                    </p>

                    <p className="mt-1 text-xs text-yellow-600">
                      For development testing only. No real
                      transaction will occur.
                    </p>

                  </div>

                ) : (

                  <p className="mt-4 text-center text-xs text-gray-400">
                    You will pay ₹{total.toFixed(2)} when
                    your order is delivered.
                  </p>

                )}

                <p className="mt-3 text-center text-xs text-gray-400">
                  Product prices and stock are verified by
                  the server before your order is created.
                </p>

              </div>

            </div>

          </div>

        )}

      </section>

    </main>
  );
}
