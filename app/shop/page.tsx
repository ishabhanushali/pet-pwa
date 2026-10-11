
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../../components/CartProvider";
import type { Product } from "../../components/CartProvider";

const categories = [
  { name: "All", emoji: "🐾" },
  { name: "Dog Food", emoji: "🐶" },
  { name: "Cat Food", emoji: "🐱" },
  { name: "Treats", emoji: "🦴" },
  { name: "Cat Litter", emoji: "🧺" },
];

const productColors = [
  "bg-[#FFF0E4]",
  "bg-[#EAF5E9]",
  "bg-[#FFF4D9]",
  "bg-[#F1EAF9]",
  "bg-[#E7F4F5]",
  "bg-[#FDEBF0]",
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

  // Load customer
  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          if (active) setCustomer(null);
          return;
        }

        const data = await response.json();
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

    void loadCustomer();

    return () => {
      active = false;
    };
  }, []);

  // Logout
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
    } catch (err) {
      console.error("Logout error:", err);
      setLogoutError("Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  // Load products
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Could not load products");
        }

        const data: Product[] = await response.json();

        if (active) setProducts(data);
      } catch (err) {
        console.error("Product loading error:", err);

        if (active) {
          setError(
            "Oops! Our furry friends couldn't fetch the products. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  function getQuantity(productId: number) {
    const item = cartItems.find(
      (cartItem) => cartItem.id === productId
    );

    return item?.quantity ?? 0;
  }

  // Analytics
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
      console.error("Analytics error:", err);
    }
  }

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

  function scrollToProducts() {
    document
      .getElementById("shop-products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  const firstName =
    customer?.name.trim().split(/\s+/)[0] || "";

  return (
    <main className="min-h-screen bg-[#FFFCF7] text-[#193D32]">
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        🐾 Happy pets, happy hearts! Little joys delivered with love 💚
      </div>

      {/* NAVBAR */}
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
            {[
              { name: "Home", href: "/" },
              { name: "Shop", href: "/shop" },
              { name: "My Pets", href: "/pets" },
              { name: "Orders", href: "/orders" },
              { name: "Rewards", href: "/rewards" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold transition hover:text-[#E77B49] ${
                  item.href === "/shop"
                    ? "text-[#E77B49]"
                    : "text-[#486357]"
                }`}
              >
                {item.name}
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
                  className="rounded-full border border-[#F6D7CB] bg-white px-3 py-2 text-xs font-bold text-[#D46F4C] transition hover:bg-[#FFF0E9] disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  {loggingOut ? "..." : "Logout"}
                </button>
              </>
            ) : (
              <Link
                href="/login?next=%2Fshop"
                className="rounded-full bg-[#245C46] px-4 py-2 text-sm font-bold text-white"
              >
                Login
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Cart with ${cartCount} items`}
              className="relative rounded-full bg-[#FFF0E4] px-3 py-2 text-xl transition hover:scale-105"
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

        {/* MOBILE NAV */}
        <div className="flex items-center justify-start gap-6 overflow-x-auto border-t border-[#F0F1EA] px-5 py-3 text-sm font-semibold lg:hidden">
          {[
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            { name: "My Pets", href: "/pets" },
            { name: "Orders", href: "/orders" },
            { name: "Rewards", href: "/rewards" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 ${
                item.href === "/shop"
                  ? "text-[#E77B49]"
                  : "text-[#536A5D]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {logoutError && (
          <p
            role="alert"
            className="px-6 pb-3 text-sm text-red-600"
          >
            {logoutError}
          </p>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#FFF5E9]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#FFE4CE] opacity-70" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#E6F1DF] opacity-80" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:py-16 lg:py-20">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F9DCC7] bg-white px-4 py-2 text-xs font-extrabold tracking-wide text-[#DC7A49]">
              🐾 THE HAPPY PAWS SHOP
            </span>

            <h2 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight text-[#20513F] sm:text-5xl lg:text-6xl">
              Little treats,
              <br />
              <span className="text-[#E98557]">
                big tail wags!
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-base leading-8 text-[#64796B] sm:text-lg">
              From yummy bites to everyday essentials,
              find everything your furry bestie loves.
              Because every paw deserves a little extra
              happiness!
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToProducts}
                className="rounded-full bg-[#245C46] px-7 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#194633]"
              >
                Shop the Goodies 🛍️
              </button>

              <Link
                href="/pets"
                className="rounded-full border border-[#D5E6D5] bg-white px-6 py-3.5 text-sm font-bold text-[#245C46] transition hover:bg-[#EAF5E9]"
              >
                Meet My Pets 🐶
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-[#64806E] sm:text-sm">
              <span>💚 Made for pet lovers</span>
              <span>🎁 Little surprises</span>
              <span>🐾 Lots of love</span>
            </div>
          </div>

          {/* PLAYFUL HERO ILLUSTRATION */}
          <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center sm:h-96">
            <div className="absolute h-64 w-64 rounded-full bg-[#F8DFC9] sm:h-80 sm:w-80" />
            <div className="absolute right-5 top-5 h-24 w-24 rounded-full bg-[#E2F0DD]" />
            <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-[#FFF9D8]" />

            <span className="absolute left-8 top-7 rotate-[-15deg] text-4xl">
              🦴
            </span>
            <span className="absolute right-7 top-16 rotate-12 text-4xl">
              🐟
            </span>
            <span className="absolute bottom-8 right-9 text-4xl">
              🐾
            </span>

            <div className="relative flex items-end justify-center gap-1 drop-shadow-xl">
              <span className="text-[105px] leading-none sm:text-[140px]">
                🐶
              </span>
              <span className="text-[90px] leading-none sm:text-[120px]">
                🐱
              </span>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rotate-[-4deg] whitespace-nowrap rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#245C46] shadow-lg">
              ✨ Your pet's happy place!
            </div>
          </div>
        </div>
      </section>

      {/* MINI BENEFITS */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: "💚",
              title: "Picked with love",
              subtitle: "Happy little essentials",
              bg: "bg-[#EAF5E9]",
            },
            {
              icon: "🎁",
              title: "Paw-some finds",
              subtitle: "Treats worth wagging for",
              bg: "bg-[#FFF0E4]",
            },
            {
              icon: "🐾",
              title: "For every furry friend",
              subtitle: "Dogs, cats & cuddles",
              bg: "bg-[#F3EDFA]",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`flex items-center gap-4 rounded-3xl ${item.bg} px-5 py-4`}
            >
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="font-extrabold text-[#245C46]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#718478]">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section
        id="shop-products"
        className="mx-auto max-w-7xl scroll-mt-36 px-5 py-14 sm:px-8"
      >
        <div className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E98557]">
            ✨ EXPLORE THE GOODIES
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#245C46] sm:text-4xl">
            Something for every paw 🐾
          </h2>

          <p className="mt-3 text-sm text-[#718478]">
            Find their next favorite thing, one happy
            little treat at a time.
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => {
            const active =
              selectedCategory === category.name;

            return (
              <button
                key={category.name}
                type="button"
                onClick={() =>
                  setSelectedCategory(category.name)
                }
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
                  active
                    ? "border-[#245C46] bg-[#245C46] text-white shadow-md"
                    : "border-[#E3EAE0] bg-white text-[#536C5D] hover:border-[#A9CCAE] hover:bg-[#EAF5E9]"
                }`}
              >
                <span>{category.emoji}</span>
                {category.name}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="rounded-3xl bg-[#EAF5E9] py-20 text-center">
            <div className="animate-bounce text-5xl">
              🐾
            </div>
            <p className="mt-4 font-bold text-[#245C46]">
              Fetching something paw-some...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center font-semibold text-red-600"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-[#718478]">
                Showing{" "}
                <span className="font-extrabold text-[#245C46]">
                  {filteredProducts.length}
                </span>{" "}
                paw-some products
              </p>

              <span className="hidden rounded-full bg-[#EAF5E9] px-4 py-2 text-xs font-bold text-[#245C46] sm:inline-block">
                💚 Made for happy pets
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-[#E3EAE0] bg-white px-6 py-16 text-center">
                <div className="text-6xl">🐾</div>
                <h3 className="mt-5 text-xl font-extrabold text-[#245C46]">
                  No goodies found yet!
                </h3>
                <p className="mt-2 text-[#718478]">
                  Try another category to find more
                  paw-some things.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory("All")
                  }
                  className="mt-6 rounded-full bg-[#245C46] px-6 py-3 font-bold text-white"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => {
                  const quantity = getQuantity(product.id);

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
                    <article
                      key={product.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E6EAE2] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* IMAGE / EMOJI */}
                      <div
                        className={`relative flex h-52 items-center justify-center overflow-hidden ${
                          productColors[
                            index % productColors.length
                          ]
                        }`}
                      >
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-white/30" />
                        <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/20" />

                        <span className="relative z-10 text-7xl transition duration-300 group-hover:scale-110">
                          {product.image || "🐾"}
                        </span>

                        {discount > 0 && (
                          <span className="absolute left-4 top-4 rounded-full bg-[#D8F7E2] px-3 py-1.5 text-xs font-extrabold text-[#206E46]">
                            ✨ {discount}% OFF
                          </span>
                        )}

                        {!product.inStock && (
                          <span className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-600">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#E98557]">
                          {product.brand}
                        </p>

                        <h3 className="mt-2 min-h-12 text-lg font-extrabold leading-snug text-[#245C46]">
                          {product.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#788B7D]">
                          {product.description}
                        </p>

                        <div className="mt-4">
                          <span className="inline-flex rounded-full bg-[#F3F6EF] px-3 py-1.5 text-xs font-bold text-[#64806E]">
                            📦 {product.packSize}
                          </span>
                        </div>

                        <div className="mt-auto pt-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-2xl font-black text-[#245C46]">
                              ₹{product.price}
                            </span>

                            {product.mrp > product.price && (
                              <span className="text-sm text-[#A1ACA3] line-through">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            {!product.inStock ? (
                              <button
                                type="button"
                                disabled
                                className="w-full cursor-not-allowed rounded-2xl bg-gray-100 px-4 py-3 font-bold text-gray-400"
                              >
                                Currently Unavailable
                              </button>
                            ) : quantity === 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddToCart(product)
                                }
                                className="w-full rounded-2xl bg-[#245C46] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#194633]"
                              >
                                🛒 Add to Cart
                              </button>
                            ) : (
                              <div className="flex items-center justify-between overflow-hidden rounded-2xl border-2 border-[#245C46] bg-[#F3FAF3]">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${product.name} quantity`}
                                  onClick={() =>
                                    decreaseQuantity(
                                      product.id
                                    )
                                  }
                                  className="px-5 py-3 text-xl font-black text-[#245C46] hover:bg-[#E3F2E3]"
                                >
                                  −
                                </button>

                                <div className="text-center">
                                  <p className="text-[10px] font-semibold text-[#788B7D]">
                                    IN YOUR CART
                                  </p>
                                  <p className="font-black text-[#245C46]">
                                    {quantity}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  aria-label={`Increase ${product.name} quantity`}
                                  onClick={() =>
                                    increaseQuantity(
                                      product.id
                                    )
                                  }
                                  className="px-5 py-3 text-xl font-black text-[#245C46] hover:bg-[#E3F2E3]"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* SUPPORT BANNER */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#E8F4E8] p-7 sm:p-10">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#D3EBD4]" />

          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#E98557]">
                🐾 WE'RE HERE TO HELP
              </p>

              <h3 className="mt-2 text-2xl font-black text-[#245C46] sm:text-3xl">
                Not sure what your pet needs?
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#64806E]">
                Every furry friend is special! Reach
                out and we'll help you find the right
                goodies for your little companion.
              </p>
            </div>

            <Link
              href="/support"
              className="shrink-0 rounded-full bg-[#245C46] px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              Let's Chat 💬
            </Link>
          </div>
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
