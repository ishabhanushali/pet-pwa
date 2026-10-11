
import Link from "next/link";
import { cookies } from "next/headers";
import crypto from "crypto";

import LogoutButton from "../components/LogoutButton";
import { prisma } from "../lib/prisma";

const categories = [
  {
    name: "Dog Food",
    subtitle: "Good food, happy tails.",
    image:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Cat Food",
    subtitle: "Purr-worthy mealtimes.",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Treats",
    subtitle: "Little rewards, big love.",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Cat Litter",
    subtitle: "Fresh spaces for curious cats.",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=85",
  },
];

const features = [
  {
    title: "My Orders",
    subtitle: "All your orders in one place.",
    icon: "📦",
    href: "/orders",
    color: "bg-[#EDF3FF]",
  },
  {
    title: "Paw Points",
    subtitle: "Discover rewards for your pets.",
    icon: "🎁",
    href: "/rewards",
    color: "bg-[#FFF2D8]",
  },
  {
    title: "Pet Reminders",
    subtitle: "Never miss important pet care.",
    icon: "🔔",
    href: "/reminders",
    color: "bg-[#F3EEFF]",
  },
];

export default async function Home() {
  // CUSTOMER SESSION
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("customerSession")?.value;

  let customer: { name: string } | null = null;

  if (sessionToken) {
    try {
      const tokenHash = crypto
        .createHash("sha256")
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
        customer = session.customer;
      }
    } catch (error) {
      console.error("Home session error:", error);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFCF7] text-[#203D34]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-[#EEE7DB] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
          {/* LOGO */}
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0DC] text-xl sm:h-11 sm:w-11 sm:text-2xl">
              🐾
            </span>

            <div>
              <h1 className="whitespace-nowrap text-sm font-black sm:text-lg">
                Pet PWA
              </h1>

              <p className="hidden text-[10px] text-[#74877E] sm:block">
                Happy pets, happy homes.
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-5 text-sm font-semibold text-[#425F52] xl:flex">
            <Link href="/shop" className="hover:text-orange-600">
              Shop
            </Link>

            <Link href="/pets" className="hover:text-orange-600">
              My Pets
            </Link>

            <Link href="/orders" className="hover:text-orange-600">
              Orders
            </Link>

            <Link href="/rewards" className="hover:text-orange-600">
              Rewards
            </Link>

            <Link href="/reminders" className="hover:text-orange-600">
              Reminders
            </Link>

            <Link href="/support" className="hover:text-orange-600">
              Support
            </Link>
          </nav>

          {/* ACCOUNT ACTIONS */}
          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
            {/* CART */}
            <Link
              href="/cart"
              aria-label="View cart"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6EC] text-base text-[#24684E] sm:h-10 sm:w-auto sm:px-3"
            >
              🛒

              <span className="hidden pl-1 text-sm font-bold sm:inline">
                Cart
              </span>
            </Link>

            {customer ? (
              <>
                {/* MOBILE PROFILE ICON */}
                <Link
                  href="/profile"
                  aria-label="My profile"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0DC] text-base text-[#82522B] sm:hidden"
                >
                  👤
                </Link>

                {/* DESKTOP CUSTOMER NAME */}
                <Link
                  href="/profile"
                  className="hidden max-w-32 truncate rounded-xl bg-[#FFF0DC] px-3 py-2 text-xs font-bold text-[#82522B] sm:block xl:max-w-40"
                >
                  👤 {customer.name}
                </Link>

                {/* LOGOUT */}
                <div className="shrink-0 [&_button]:whitespace-nowrap [&_button]:px-2 [&_button]:py-2 [&_button]:text-xs sm:[&_button]:px-3">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="shrink-0 whitespace-nowrap rounded-xl bg-[#24684E] px-3 py-2 text-xs font-bold text-white hover:bg-[#194D3A] sm:px-4 sm:text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        <nav className="flex w-full items-center gap-5 overflow-x-auto border-t border-[#F1ECE4] px-4 py-3 text-xs font-bold text-[#496257] xl:hidden">
          <Link href="/shop" className="shrink-0">
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

          <Link href="/reminders" className="shrink-0">
            Reminders
          </Link>

          <Link href="/support" className="shrink-0">
            Support
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FFF1DE]">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#FFDAA8]/50 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          {/* HERO TEXT */}
          <div className="relative z-10">
            <span className="inline-block rounded-full border border-[#F0D2B3] bg-white/80 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-[#B75E28]">
              🐾 For every wag & purr
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Their favourites.
              <br />

              <span className="text-[#E16A29]">
                Delivered with love.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#61756B] sm:text-lg">
              Food, treats and everyday essentials
              for the furry family members who make
              your house a home.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-2xl bg-[#24684E] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#194D3A]"
              >
                Shop Essentials →
              </Link>

              <Link
                href="/pets"
                className="rounded-2xl border border-[#EBC7A7] bg-white px-7 py-3.5 text-sm font-extrabold text-[#91572D] hover:bg-[#FFF9F0]"
              >
                Explore Pet ID
              </Link>
            </div>

            <p className="mt-7 text-xs font-semibold text-[#789084]">
              Good food • Happy tails • Thoughtful care
            </p>
          </div>

          {/* HERO IMAGE */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-[2.5rem] border-[7px] border-white bg-[#F5DEC1] shadow-2xl shadow-orange-900/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=85"
                alt="Happy dogs enjoying time together"
                className="h-[300px] w-full object-cover sm:h-[390px]"
              />
            </div>

            <div className="absolute -bottom-4 left-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#285F49] shadow-xl">
              ❤️ Made for pet parents
            </div>

            <div className="absolute -right-2 top-6 rotate-6 rounded-full bg-[#F9C96C] px-4 py-3 text-sm font-black text-[#684A23] shadow-lg">
              Pawsome!
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#D16A2C]">
              The good stuff
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Shop by Category 🐾
            </h2>

            <p className="mt-3 text-sm text-[#728278]">
              All their everyday favourites,
              easy to find.
            </p>
          </div>

          <Link
            href="/shop"
            className="text-sm font-extrabold text-[#27694E] hover:underline"
          >
            Explore the Shop →
          </Link>
        </div>

        {/* EQUAL HEIGHT CATEGORY CARDS */}
        <div className="mt-9 grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="/shop"
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#EEE9DF] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* FIXED IMAGE HEIGHT */}
              <div className="h-36 w-full shrink-0 overflow-hidden bg-[#F8F0E5] sm:h-48 lg:h-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* CARD CONTENT */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="text-base font-black sm:text-lg">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#78887E]">
                  {category.subtitle}
                </p>

                <span className="mt-auto inline-block pt-5 text-xs font-extrabold text-[#D36A2D]">
                  Shop Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PLAYFUL SHOP PROMOTION */}
      <section className="bg-[#F1F7EE]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 md:grid-cols-2">
          <div className="rounded-[2rem] bg-[#E0EEDB] p-5 text-center sm:p-8">
            <div className="text-6xl sm:text-7xl">
              🐶 🦴 🐱
            </div>

            <p className="mt-5 text-sm font-bold text-[#367556]">
              LITTLE TREATS. BIG SMILES.
            </p>

            <h3 className="mt-2 text-2xl font-black">
              Something for every furry friend.
            </h3>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#3C8660]">
              Everyday happiness
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Because they deserve
              <span className="text-[#3C8660]">
                {" "}a little extra love.
              </span>
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-[#647C6E]">
              Explore pet food, treats and everyday
              essentials, all in one convenient shop.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block rounded-2xl bg-[#24684E] px-7 py-3.5 text-sm font-extrabold text-white hover:bg-[#194D3A]"
            >
              Discover Products →
            </Link>
          </div>
        </div>
      </section>

      {/* DIGITAL PET ID */}
      <section className="bg-[#E5F0E3]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#367556]">
              More Than a Pet Shop
            </span>

            <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
              Every pet has a story.
              <br />

              <span className="text-[#3C8660]">
                Give yours an ID.
              </span>
            </h2>

            <p className="mt-5 max-w-lg leading-8 text-[#5F7769]">
              Create a digital profile for your best
              friend with a unique permanent Pet ID
              and a scannable QR code.
              A little identity that makes pet care
              more connected.
            </p>

            <Link
              href="/pets"
              className="mt-7 inline-block rounded-2xl bg-[#24684E] px-7 py-3.5 text-sm font-extrabold text-white hover:bg-[#194D3A]"
            >
              Create a Pet Profile →
            </Link>
          </div>

          {/* SAMPLE PET ID CARD */}
          <div className="mx-auto w-full max-w-sm">
            <div className="-rotate-2 rounded-[2rem] bg-white p-6 shadow-xl shadow-green-900/10 transition hover:rotate-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#D16A2C]">
                    Digital Pet ID
                  </p>

                  <h3 className="mt-3 text-2xl font-black">
                    Meet Bruno
                  </h3>

                  <p className="mt-1 text-xs text-[#7C8B81]">
                    Your furry best friend
                  </p>
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1DE] text-5xl">
                  🐶
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#FFF4E5] p-4">
                <p className="text-xs font-bold text-[#9A7C5C]">
                  Sample Permanent Pet ID
                </p>

                <p className="mt-2 text-2xl font-black tracking-wider text-[#D16A2C]">
                  P000127
                </p>
              </div>

              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#E5ECE6] p-4">
                <div className="text-5xl">
                  ▦
                </div>

                <div>
                  <h4 className="font-black">
                    QR-Linked Profile
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-[#829187]">
                    Quick access to approved pet
                    details.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-[#829187]">
                🐾 Every pet is one of a kind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT FEATURES */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#D16A2C]">
            Little Extras
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Care Made a Little Easier
          </h2>

          <p className="mt-3 text-sm text-[#718278]">
            Useful tools for your everyday pet-parent life.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`group rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-md ${feature.color}`}
            >
              <span className="text-4xl">
                {feature.icon}
              </span>

              <h3 className="mt-5 text-xl font-black">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#718278]">
                {feature.subtitle}
              </p>

              <p className="mt-5 text-xs font-black text-[#286A4F]">
                Explore →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SUPPORT */}
      <section className="bg-[#FFF0DE]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#C36A31]">
              Need a Helping Paw?
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              We&apos;re All Ears! 🐾
            </h2>

            <p className="mt-3 max-w-lg leading-7 text-[#6B7E72]">
              Questions about an order, Pet ID or
              your account? Find the support you need.
            </p>
          </div>

          <Link
            href="/support"
            className="rounded-2xl bg-[#24684E] px-7 py-3.5 text-sm font-extrabold text-white hover:bg-[#194D3A]"
          >
            Contact Support →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#183C30] text-white">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-xl font-black"
            >
              🐾 Pet PWA
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-7 text-[#C1D3C8]">
              Everyday essentials and a little
              extra love for the pets who make
              life brighter.
            </p>
          </div>

          <div>
            <h3 className="font-black">
              Explore
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#C1D3C8]">
              <Link href="/shop">Shop</Link>
              <Link href="/pets">My Pets</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </div>

          <div>
            <h3 className="font-black">
              My Account
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#C1D3C8]">
              <Link href="/profile">Profile</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/rewards">Paw Points</Link>
              <Link href="/reminders">Reminders</Link>
            </div>
          </div>

          <div>
            <h3 className="font-black">
              Help
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#C1D3C8]">
              <Link href="/support">
                Customer Support
              </Link>

              {!customer && (
                <>
                  <Link href="/login">Login</Link>
                  <Link href="/signup">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#B5C9BD]">
          © {new Date().getFullYear()} Pet PWA.
          Made for happy paws.
        </div>
      </footer>
    </main>
  );
}
