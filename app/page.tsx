
import Link from "next/link";
import { cookies } from "next/headers";
import { createHash } from "crypto";

import { prisma } from "../lib/prisma";
import LogoutButton from "../components/LogoutButton";
import HeroCarousel from "../components/HeroCarousel";
import CategoryCarousel from "../components/CategoryCarousel";

const navigation = [
  { name: "Shop", href: "/shop" },
  { name: "My Pets", href: "/pets" },
  { name: "Orders", href: "/orders" },
  { name: "Rewards", href: "/rewards" },
  { name: "Reminders", href: "/reminders" },
  { name: "Support", href: "/support" },
];

const categories = [
  {
    name: "Dog Food",
    description: "Good food for happy tails.",
    image:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1000&q=85",
    color: "#F8E9D9",
  },
  {
    name: "Cat Food",
    description: "Purr-worthy mealtimes.",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=85",
    color: "#E7F0E5",
  },
  {
    name: "Treats",
    description: "Little rewards, big love.",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=85",
    color: "#FFF1DA",
  },
  {
    name: "Cat Litter",
    description: "Fresh spaces for curious cats.",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=85",
    color: "#F2EAF9",
  },
];

const shortcuts = [
  {
    name: "My Pets",
    description: "Digital profiles and Pet IDs",
    icon: "🐶",
    href: "/pets",
    color: "#FDEBDD",
  },
  {
    name: "My Orders",
    description: "Track your purchases",
    icon: "📦",
    href: "/orders",
    color: "#E9F1FD",
  },
  {
    name: "Paw Points",
    description: "Explore your rewards",
    icon: "🎁",
    href: "/rewards",
    color: "#FFF2D9",
  },
  {
    name: "Reminders",
    description: "Stay on top of pet care",
    icon: "🔔",
    href: "/reminders",
    color: "#F1EAFC",
  },
];

export default async function Home() {
  // CUSTOMER AUTHENTICATION
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("customerSession")?.value;

  let customer: { name: string | null } | null = null;

  if (sessionToken) {
    try {
      const tokenHash = createHash("sha256")
        .update(sessionToken)
        .digest("hex");

      const session =
        await prisma.customerSession.findUnique({
          where: { tokenHash },
          include: { customer: true },
        });

      if (
        session &&
        session.expiresAt.getTime() > Date.now()
      ) {
        customer = {
          name: session.customer.name,
        };
      }
    } catch (error) {
      console.error("Homepage session error:", error);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFCF8] text-[#1D4033]">

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#173E68] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🐾 Everything your furry friend loves, all in one place!
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#E9E8E1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap">

          {/* LOGO */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-lg font-black sm:text-xl"
          >
            <span className="rounded-xl bg-[#FFECD7] p-2 text-xl">
              🐾
            </span>
            Pet PWA
          </Link>

          {/* NAVIGATION */}
          <nav className="order-3 flex w-full items-center gap-4 overflow-x-auto whitespace-nowrap py-2 text-xs font-bold sm:gap-5 sm:text-sm lg:order-2 lg:w-auto lg:min-w-0 lg:flex-1 lg:justify-center lg:py-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="shrink-0 transition-colors hover:text-[#D36F39]"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CART AND LOGIN / PROFILE */}
          <div className="order-2 flex shrink-0 items-center gap-2 text-sm font-bold lg:order-3">
            <Link
              href="/cart"
              className="rounded-xl bg-[#EAF4EB] px-3 py-2"
            >
              🛒
              <span className="hidden sm:inline">
                {" "}Cart
              </span>
            </Link>

            {customer ? (
              <>
               
<Link
  href="/profile"
  className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#FFF1DD] px-3 py-2 text-sm font-bold text-[#194532] transition hover:bg-[#FFE5C4]"
>
  <span>👤</span>
  <span>
    {customer.name
      ? `Hi, ${customer.name.trim().split(/\s+/)[0]}`
      : "My Profile"}
  </span>
</Link>


                <div className="[&_button]:px-2 [&_button]:py-2 [&_button]:text-xs">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-[#205D43] px-4 py-2 text-white transition hover:bg-[#174934]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* AUTOMATIC CHANGING HERO BANNER */}
      <HeroCarousel />

      {/* MOVING ROUND CATEGORY CAROUSEL */}
      <CategoryCarousel />

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#D36F39]">
              For Every Wag and Purr
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-4xl">
              Shop by Category
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-sm font-bold text-[#205D43]"
          >
            Explore Shop →
          </Link>
        </div>

        {/* EQUAL HEIGHT CATEGORY CARDS */}
        <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="/shop"
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E9E4DB] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={{
                backgroundColor: category.color,
              }}
            >
              {/* IMAGE AREA */}
              <div className="flex h-40 w-full items-center justify-center overflow-hidden bg-[#F3F0EA] sm:h-56 lg:h-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-contain object-center"
                />
              </div>

              {/* TEXT AREA */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-lg font-black sm:text-xl">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#617569] sm:text-sm">
                  {category.description}
                </p>

                <span className="mt-auto pt-4 text-xs font-black text-[#B95F32]">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EVERYDAY HAPPINESS PROMOTION */}
      <section className="bg-[#F1F7EE] py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 px-4 sm:px-6 md:grid-cols-2 md:gap-10">

          {/* LEFT PANEL */}
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[2rem] bg-[#E0EEDB] px-6 py-10 text-center sm:min-h-[280px]">
            <div className="flex items-center justify-center gap-5 text-5xl sm:text-6xl">
              <span>🐶</span>
              <span>🦴</span>
              <span>🐱</span>
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-widest text-[#367556]">
              Little Treats. Big Smiles.
            </p>

            <h3 className="mt-3 text-xl font-black text-[#203D34] sm:text-2xl">
              Something for every furry friend.
            </h3>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex h-full flex-col justify-center py-4">
            <p className="text-xs font-black uppercase tracking-widest text-[#367556]">
              Everyday Happiness
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-[#203D34] sm:text-4xl">
              Because they deserve{" "}
              <span className="text-[#3C8660]">
                a little extra love.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#647C6E] sm:text-base">
              Explore food, treats and everyday essentials,
              all in one convenient shop.
            </p>

            <div className="mt-7">
              <Link
                href="/shop"
                className="inline-block rounded-xl bg-[#24684E] px-7 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#194D3A]"
              >
                Discover Products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL PET ID */}
      <section className="overflow-hidden bg-[#E7F1E7] py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2 md:gap-12">

          {/* LEFT TEXT */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#317754]">
              More Than a Pet Shop
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Every pet has a story.
              <br />
              <span className="text-[#3C8660]">
                Give yours an ID.
              </span>
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-[#60766A]">
              Create a digital profile for your best friend
              with a unique permanent Pet ID and a
              scannable QR code. A little identity
              that makes pet care more connected.
            </p>

            <Link
              href="/pets"
              className="mt-6 inline-block rounded-xl bg-[#205D43] px-6 py-3 font-bold text-white"
            >
              Create a Pet Profile →
            </Link>
          </div>

          {/* FLOATING DIGITAL PET ID CARD */}
          <div className="flex items-center justify-center px-3 py-10 sm:px-6">
            <div className="pet-id-float w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl">

              {/* CARD HEADER */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#D16A2C]">
                    Digital Pet ID
                  </p>

                  <h3 className="mt-3 text-2xl font-black text-[#1D4033]">
                    Meet Bruno
                  </h3>

                  <p className="mt-1 text-xs text-[#7C8B81]">
                    Your furry best friend
                  </p>
                </div>

                <div className="rounded-full bg-[#FFF1DE] p-4 text-4xl">
                  🐶
                </div>
              </div>

              {/* PET ID NUMBER */}
              <div className="mt-6 rounded-2xl bg-[#FFF4E5] p-4">
                <p className="text-xs font-bold text-[#9A7C5C]">
                  Sample Permanent Pet ID
                </p>

                <p className="mt-2 text-3xl font-black tracking-wider text-[#D16A2C]">
                  P000127
                </p>
              </div>

              {/* QR PROFILE */}
              <div className="mt-5 rounded-2xl border border-[#E5ECE6] p-4">
                <h4 className="font-black text-[#1D4033]">
                  ▦ QR-Linked Profile
                </h4>

                <p className="mt-2 text-xs leading-5 text-[#829187]">
                  Quick access to approved pet details.
                </p>
              </div>

              {/* FOOTER */}
              <p className="mt-5 text-center text-xs text-[#829187]">
                🐾 Every pet is one of a kind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT SHORTCUTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-black sm:text-4xl">
          More for Pet Parents
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className="rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-md sm:p-6"
              style={{
                backgroundColor: item.color,
              }}
            >
              <div className="text-4xl">
                {item.icon}
              </div>

              <h3 className="mt-4 text-lg font-black">
                {item.name}
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#64786B] sm:text-sm">
                {item.description}
              </p>

              <p className="mt-4 text-xs font-bold text-[#205D43]">
                Explore →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SUPPORT */}
      <section className="bg-[#FFF0DC] px-4 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black">
              Need a Helping Paw? 🐾
            </h2>

            <p className="mt-2 text-sm text-[#64786B]">
              Questions about your order or Pet ID?
              Find support here.
            </p>
          </div>

          <Link
            href="/support"
            className="rounded-xl bg-[#205D43] px-6 py-3 text-sm font-bold text-white"
          >
            Contact Support →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#193F30] px-4 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-black">
              🐾 Pet PWA
            </p>

            <p className="mt-2 text-xs text-[#C9D8CE]">
              Made with love for happy paws.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
