import Link from "next/link";
import LogoutButton from "../components/LogoutButton";

export default function Home() {
  const categories = [
    {
      name: "Dog Food",
      emoji: "🐶",
      description: "Nutritious food for happy dogs",
    },
    {
      name: "Cat Food",
      emoji: "🐱",
      description: "Healthy meals for your cat",
    },
    {
      name: "Treats",
      emoji: "🦴",
      description: "Tasty rewards they will love",
    },
    {
      name: "Cat Litter",
      emoji: "🐾",
      description: "Clean and comfortable essentials",
    },
  ];

  const features = [
    {
      emoji: "🪪",
      title: "Digital Pet ID",
      description:
        "Give your pet a permanent identity with a unique Pet ID and QR code.",
    },
    {
      emoji: "🎁",
      title: "Paw Points",
      description:
        "Earn and track Paw Points while shopping for your pets.",
    },
    {
      emoji: "📦",
      title: "Easy Reordering",
      description:
        "View previous orders and quickly reorder your pet essentials.",
    },
    {
      emoji: "⏰",
      title: "Pet Reminders",
      description:
        "Keep track of important reminders for your pets.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fafaf7] text-slate-900">
      {/* ====================================== */}
      {/* NAVBAR */}
      {/* ====================================== */}

      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
              🐾
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Pet PWA
              </h1>

              <p className="hidden text-xs text-gray-500 sm:block">
                Pet care made simple
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/shop"
              className="font-semibold text-gray-600 transition hover:text-orange-600"
            >
              Shop
            </Link>

            <Link
              href="/pets"
              className="font-semibold text-gray-600 transition hover:text-orange-600"
            >
              My Pets
            </Link>

            <Link
              href="/orders"
              className="font-semibold text-gray-600 transition hover:text-orange-600"
            >
              Orders
            </Link>

            <Link
              href="/rewards"
              className="font-semibold text-gray-600 transition hover:text-orange-600"
            >
              Paw Points
            </Link>

            <Link
              href="/support"
              className="font-semibold text-gray-600 transition hover:text-orange-600"
            >
              Support
            </Link>

            <Link
              href="/cart"
              className="rounded-xl bg-orange-100 px-4 py-2 font-bold text-orange-700 transition hover:bg-orange-200"
            >
              🛒 Cart
            </Link>

            <Link
              href="/profile"
              className="rounded-xl bg-orange-500 px-4 py-2 font-bold text-white transition hover:bg-orange-600"
            >
              Profile
            </Link>

            <LogoutButton />
          </div>

          {/* MOBILE BUTTONS */}

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/cart"
              className="rounded-xl bg-orange-100 px-3 py-2 font-bold text-orange-700"
              aria-label="Open cart"
            >
              🛒
            </Link>

            <Link
              href="/profile"
              className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white"
            >
              Profile
            </Link>

            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* ====================================== */}
      {/* HERO SECTION */}
      {/* ====================================== */}

      <section className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
          {/* LEFT */}

          <div>
            <div className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
              🐾 Everything your pet needs
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Shop. Care.
              <span className="text-orange-500">
                {" "}Protect.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Shop everyday pet essentials, create your
              pet&apos;s digital identity and keep everything
              about your furry family in one simple place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="rounded-xl bg-orange-500 px-7 py-4 text-center font-bold text-white shadow-sm transition hover:bg-orange-600"
              >
                Shop Now →
              </Link>

              <Link
                href="/pets"
                className="rounded-xl border border-orange-200 bg-white px-7 py-4 text-center font-bold text-orange-600 transition hover:bg-orange-50"
              >
                🐾 Create Pet Profile
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-600">
              <span>✓ Digital Pet ID</span>
              <span>✓ Paw Points</span>
              <span>✓ Easy Reorder</span>
            </div>
          </div>

          {/* RIGHT */}

          <div className="relative">
            <div className="rounded-[2rem] bg-orange-100 p-6 sm:p-10">
              <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
                <div className="text-8xl sm:text-9xl">
                  🐶
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  Happy pets.
                </h2>

                <p className="mt-2 text-gray-500">
                  Happy pet parents.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-orange-50 p-3">
                    <div className="text-2xl">
                      🛍️
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      Shop
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-3">
                    <div className="text-2xl">
                      🪪
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      Pet ID
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-50 p-3">
                    <div className="text-2xl">
                      🎁
                    </div>

                    <p className="mt-1 text-xs font-bold">
                      Rewards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* CATEGORIES */}
      {/* ====================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <p className="font-bold uppercase tracking-wider text-orange-600">
            Shop by category
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Pet essentials made easy
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-gray-500">
            Find everyday essentials for your dog or cat
            in just a few taps.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href="/shop"
              className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-4xl transition group-hover:bg-orange-100">
                {category.emoji}
              </div>

              <h3 className="mt-5 text-xl font-bold">
                {category.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {category.description}
              </p>

              <p className="mt-4 font-bold text-orange-600">
                Shop now →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ====================================== */}
      {/* DIGITAL PET ID */}
      {/* ====================================== */}

      <section className="bg-slate-900">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 text-white md:grid-cols-2">
          {/* PET ID SAMPLE */}

          <div>
            <div className="mx-auto max-w-sm rounded-[2rem] bg-white p-6 text-slate-900 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    Digital Pet ID
                  </p>

                  <h3 className="mt-1 text-2xl font-bold">
                    Bruno
                  </h3>
                </div>

                <div className="text-5xl">
                  🐕
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-orange-50 p-5">
                <p className="text-sm text-gray-500">
                  Permanent Pet ID
                </p>

                <p className="mt-1 text-2xl font-black tracking-wider text-orange-600">
                  P000127
                </p>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-900 text-4xl text-white">
                  ▦
                </div>

                <div>
                  <p className="font-bold">
                    Scan QR
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quickly access the approved
                    public pet profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div>
            <p className="font-bold uppercase tracking-wider text-orange-400">
              Pet Identity
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              A permanent digital identity for your pet.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-300">
              Create a pet profile and receive a unique
              permanent Pet ID. Your pet&apos;s QR code can
              provide quick access to approved information
              while keeping private owner details protected.
            </p>

            <div className="mt-7 space-y-3 text-slate-200">
              <p>✓ Unique permanent Pet ID</p>
              <p>✓ QR-based pet profile</p>
              <p>✓ Privacy-friendly public view</p>
              <p>✓ Multiple pets per account</p>
            </div>

            <Link
              href="/pets"
              className="mt-8 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Create Pet Profile →
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* FEATURES */}
      {/* ====================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <p className="font-bold uppercase tracking-wider text-orange-600">
            More than a pet shop
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Everything in one place
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-gray-200 bg-white p-6"
            >
              <div className="text-4xl">
                {feature.emoji}
              </div>

              <h3 className="mt-4 text-xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================== */}
      {/* QUICK ACTIONS */}
      {/* ====================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/orders"
              className="rounded-2xl bg-blue-50 p-6 transition hover:shadow-md"
            >
              <div className="text-3xl">
                📦
              </div>

              <h3 className="mt-3 font-bold">
                My Orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Track and reorder purchases.
              </p>
            </Link>

            <Link
              href="/rewards"
              className="rounded-2xl bg-yellow-50 p-6 transition hover:shadow-md"
            >
              <div className="text-3xl">
                🎁
              </div>

              <h3 className="mt-3 font-bold">
                Paw Points
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Check your rewards balance.
              </p>
            </Link>

            <Link
              href="/reminders"
              className="rounded-2xl bg-purple-50 p-6 transition hover:shadow-md"
            >
              <div className="text-3xl">
                ⏰
              </div>

              <h3 className="mt-3 font-bold">
                Reminders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Manage pet care reminders.
              </p>
            </Link>

            <Link
              href="/support"
              className="rounded-2xl bg-green-50 p-6 transition hover:shadow-md"
            >
              <div className="text-3xl">
                💬
              </div>

              <h3 className="mt-3 font-bold">
                Support
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                WhatsApp or call for help.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* CUSTOMER SUPPORT */}
      {/* ====================================== */}

      <section className="bg-orange-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col items-center justify-between gap-7 rounded-3xl bg-white p-8 shadow-sm md:flex-row md:p-10">
            <div className="max-w-2xl">
              <p className="font-bold uppercase tracking-wider text-orange-600">
                Need Help?
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                We&apos;re here for you 🐾
              </h2>

              <p className="mt-3 leading-7 text-gray-500">
                Need help with an order, product, Pet ID,
                Paw Points or your account? Contact our
                customer support team.
              </p>
            </div>

            <Link
              href="/support"
              className="shrink-0 rounded-xl bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* FINAL CTA */}
      {/* ====================================== */}

      <section className="bg-orange-500">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-white">
          <div className="text-5xl">
            🐾
          </div>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Give your pet the care they deserve.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-orange-50">
            Shop pet essentials, create a digital Pet ID
            and manage your pet&apos;s everyday needs from
            one place.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-xl bg-white px-7 py-3 font-bold text-orange-600 transition hover:bg-orange-50"
            >
              Start Shopping
            </Link>

            <Link
              href="/pets"
              className="rounded-xl border border-white/40 px-7 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Create Pet Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================== */}
      {/* FOOTER */}
      {/* ====================================== */}

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            {/* BRAND */}

            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="text-3xl">
                  🐾
                </div>

                <h2 className="text-xl font-bold">
                  Pet PWA
                </h2>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Pet shopping, digital identity and
                everyday pet care made simple.
              </p>
            </div>

            {/* SHOP */}

            <div>
              <h3 className="font-bold">
                Shop
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/shop"
                  className="hover:text-white"
                >
                  All Products
                </Link>

                <Link
                  href="/cart"
                  className="hover:text-white"
                >
                  Cart
                </Link>

                <Link
                  href="/orders"
                  className="hover:text-white"
                >
                  Orders
                </Link>
              </div>
            </div>

            {/* ACCOUNT */}

            <div>
              <h3 className="font-bold">
                My Account
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/profile"
                  className="hover:text-white"
                >
                  Profile
                </Link>

                <Link
                  href="/pets"
                  className="hover:text-white"
                >
                  My Pets
                </Link>

                <Link
                  href="/rewards"
                  className="hover:text-white"
                >
                  Paw Points
                </Link>

                <Link
                  href="/reminders"
                  className="hover:text-white"
                >
                  Reminders
                </Link>
              </div>
            </div>

            {/* HELP */}

            <div>
              <h3 className="font-bold">
                Help
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/support"
                  className="hover:text-white"
                >
                  Customer Support
                </Link>

                <Link
                  href="/login"
                  className="hover:text-white"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Pet PWA. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}