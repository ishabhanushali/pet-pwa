
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../../components/CartProvider";
import type { Product } from "../../components/CartProvider";

const categories = [
  "All",
  "Dog Food",
  "Cat Food",
  "Treats",
  "Cat Litter",
];

type Customer = {
  id: number;
  name: string;
};

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const {
    cartItems,
    cartCount,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  // LOAD CUSTOMER LOGIN STATE
  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) setCustomer(null);
          return;
        }

        const data = await response.json();

        // Support common API response formats:
        // { customer: {...} }, { profile: {...} },
        // or { id, name, ... }.
        const profile =
          data.customer ?? data.profile ?? data;

        if (
          active &&
          profile &&
          typeof profile.name === "string"
        ) {
          setCustomer({
            id: profile.id,
            name: profile.name,
          });
        } else if (active) {
          setCustomer(null);
        }
      } catch (err) {
        console.error("Customer loading error:", err);
        if (active) setCustomer(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    loadCustomer();

    return () => {
      active = false;
    };
  }, []);

  // LOGOUT WITHOUT REDIRECTING
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

      // Change navbar immediately.
      // Stay on /shop.
      setCustomer(null);
    } catch (err) {
      console.error("Logout error:", err);
      setLogoutError(
        "Could not log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // LOAD PRODUCTS
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);

        setError(
          "We could not load the products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // FILTER PRODUCTS
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory
        );

  // GET CART QUANTITY
  function getQuantity(productId: number) {
    const item = cartItems.find(
      (cartItem) => cartItem.id === productId
    );

    return item?.quantity ?? 0;
  }

  // RECORD ANALYTICS
  async function trackAnalytics(
    eventName: string,
    entityType?: string,
    entityId?: number,
    metadata?: Record<
      string,
      string | number | boolean | null
    >
  ) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          entityType,
          entityId,
          metadata,
        }),
      });
    } catch (err) {
      // Analytics should not interrupt shopping.
      console.error("Analytics error:", err);
    }
  }

  // ADD PRODUCT TO CART
  function handleAddToCart(product: Product) {
    addToCart(product);

    void trackAnalytics(
      "ADD_TO_CART",
      "PRODUCT",
      product.id,
      {
        category: product.category,
        quantity: 1,
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          {/* LOGO */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
          >
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

          {/* DESKTOP LINKS */}
          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href="/"
              className="font-medium text-gray-600 hover:text-orange-600"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="font-semibold text-orange-600"
            >
              Shop
            </Link>

            <Link
              href="/pets"
              className="font-medium text-gray-600 hover:text-orange-600"
            >
              My Pets
            </Link>

            <Link
              href="/orders"
              className="font-medium text-gray-600 hover:text-orange-600"
            >
              Orders
            </Link>

            <Link
              href="/rewards"
              className="font-medium text-gray-600 hover:text-orange-600"
            >
              Rewards
            </Link>
          </div>

          {/* AUTH + CART */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {authLoading ? (
              <span className="text-sm text-gray-400">
                Loading...
              </span>
            ) : customer ? (
              <>
                {/* CUSTOMER PROFILE */}
                <Link
                  href="/profile"
                  className="max-w-36 truncate rounded-xl bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700 sm:max-w-52 sm:px-4"
                  title={customer.name}
                >
                  👤 {customer.name}
                </Link>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:px-4"
                >
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </button>
              </>
            ) : (
              /* LOGIN */
              <Link
                href="/login?next=%2Fshop"
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                Login
              </Link>
            )}

            {/* CART */}
            <Link
              href="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className="relative shrink-0 rounded-full bg-orange-50 px-4 py-2 text-xl"
            >
              🛒

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* SMALL SCREEN NAVIGATION */}
        <div className="flex items-center justify-center gap-4 overflow-x-auto border-t border-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 lg:hidden">
          <Link href="/" className="shrink-0">
            Home
          </Link>
          <Link
            href="/shop"
            className="shrink-0 text-orange-600"
          >
            Shop
          </Link>
          <Link href="/pets" className="shrink-0">
            My Pets
          </Link>
          <Link href="/orders" className="shrink-0">
            Orders
          </Link>
          <Link href="/rewards" className="shrink-0">
            Rewards
          </Link>
        </div>

        {logoutError && (
          <p
            role="alert"
            className="px-6 pb-2 text-sm text-red-600"
          >
            {logoutError}
          </p>
        )}
      </nav>

      {/* SHOP HEADER */}
      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="font-semibold uppercase tracking-wide text-orange-600">
            PET ESSENTIALS
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900 md:text-5xl">
            Shop for your best friend.
          </h2>

          <p className="mt-4 max-w-2xl text-gray-600">
            Food, treats and everyday essentials for
            happy and healthy pets.
          </p>
        </div>
      </section>

      {/* SHOP CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* CATEGORY BUTTONS */}
        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">
            <div className="text-5xl">🐾</div>
            <p className="mt-4 font-semibold text-gray-600">
              Loading products...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* PRODUCTS */}
        {!loading && !error && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
                <div className="text-6xl">🐾</div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-2 text-gray-500">
                  There are currently no products
                  in this category.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const quantity = getQuantity(
                    product.id
                  );

                  const discount =
                    product.mrp > product.price
                      ? Math.round(
                          ((product.mrp -
                            product.price) /
                            product.mrp) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-3xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* PRODUCT IMAGE */}
                      <div className="relative flex h-52 items-center justify-center bg-orange-50 text-7xl">
                        {product.image || "🐾"}

                        {discount > 0 && (
                          <span className="absolute left-4 top-4 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            {discount}% OFF
                          </span>
                        )}

                        {!product.inStock && (
                          <span className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* PRODUCT INFORMATION */}
                      <div className="p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                          {product.brand}
                        </p>

                        <h3 className="mt-2 min-h-14 text-lg font-bold text-slate-900">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {product.description}
                        </p>

                        <div className="mt-4">
                          <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                            {product.packSize}
                          </span>
                        </div>

                        {/* PRICE */}
                        <div className="mt-5 flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            ₹{product.price}
                          </span>

                          {product.mrp > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>

                        {/* CART CONTROLS */}
                        <div className="mt-5">
                          {!product.inStock ? (
                            <button
                              type="button"
                              disabled
                              className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-4 py-3 font-bold text-gray-500"
                            >
                              Out of Stock
                            </button>
                          ) : quantity === 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleAddToCart(product)
                              }
                              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <div className="flex items-center justify-between rounded-xl border-2 border-orange-500">
                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    product.id
                                  )
                                }
                                className="px-5 py-2.5 text-xl font-bold text-orange-600 hover:bg-orange-50"
                              >
                                −
                              </button>

                              <div className="text-center">
                                <p className="text-xs text-gray-400">
                                  Quantity
                                </p>

                                <p className="font-bold text-slate-900">
                                  {quantity}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    product.id
                                  )
                                }
                                className="px-5 py-2.5 text-xl font-bold text-orange-600 hover:bg-orange-50"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* SUPPORT */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="flex flex-col items-center justify-between gap-5 rounded-3xl bg-slate-900 p-8 text-white md:flex-row">
          <div>
            <h3 className="text-2xl font-bold">
              Need help choosing?
            </h3>

            <p className="mt-2 text-gray-300">
              Contact us and we&apos;ll help you
              find the right product for your pet.
            </p>
          </div>

          <Link
            href="/support"
            className="rounded-full bg-green-500 px-6 py-3 font-bold text-white hover:bg-green-600"
          >
            WhatsApp Support
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-10 text-white">
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
            © 2026 Pet PWA. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
