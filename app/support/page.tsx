
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const whatsappNumber = "919999999999";
const callNumber = "+919999999999";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "My Pets", href: "/pets" },
  { label: "Orders", href: "/orders" },
  { label: "Rewards", href: "/rewards" },
  { label: "Reminders", href: "/reminders" },
];

function Navbar() {
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) return;

        const data = await response.json();
        const profile =
          data.customer ?? data.profile ?? data;

        if (active && typeof profile?.name === "string") {
          setName(profile.name);
        }
      } catch (error) {
        console.error("Profile error:", error);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const firstName = name.trim().split(/\s+/)[0];

  return (
    <>
      <div className="bg-[#245C46] px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        🐾 A helping paw is always nearby! 💚
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#E7ECE5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🐾</span>

            <div>
              <h1 className="text-xl font-black text-[#245C46]">
                Pet PWA
              </h1>
              <p className="text-xs text-[#819287]">
                Shop • Pet ID • Rewards
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-[#486357] transition hover:text-[#E77B49]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {name ? (
              <Link
                href="/profile"
                className="rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-bold text-[#245C46]"
              >
                👋 Hi, {firstName}
              </Link>
            ) : (
              <Link
                href="/profile"
                className="rounded-full bg-[#E8F5E9] px-4 py-2 text-sm font-bold text-[#245C46]"
              >
                👤 Profile
              </Link>
            )}

            <Link
              href="/cart"
              className="rounded-full bg-[#FFF0E4] px-3 py-2 text-xl"
              aria-label="Shopping cart"
            >
              🛒
            </Link>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto border-t border-[#F0F1EA] px-5 py-3 text-sm font-semibold lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-[#536A5D]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

export default function SupportPage() {
  const whatsappMessage =
    "Hello! I need help with my Pet PWA order.";

  function openWhatsApp() {
    const message = encodeURIComponent(whatsappMessage);

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function callSupport() {
    window.location.href = `tel:${callNumber}`;
  }

  const helpTopics = [
    {
      icon: "📦",
      title: "Orders & Delivery",
      description: "Tracking, delivery and order updates",
      color: "bg-[#FFF0E4]",
    },
    {
      icon: "🛍️",
      title: "Products",
      description: "Food, treats and product questions",
      color: "bg-[#EAF5E9]",
    },
    {
      icon: "🪪",
      title: "Pet ID & QR",
      description: "Activation and Pet ID assistance",
      color: "bg-[#F2EDFA]",
    },
    {
      icon: "🐾",
      title: "Paw Points",
      description: "Rewards and points information",
      color: "bg-[#FFF4D9]",
    },
    {
      icon: "👤",
      title: "Account & Profile",
      description: "Login and profile support",
      color: "bg-[#EAF5E9]",
    },
    {
      icon: "💳",
      title: "Payments",
      description: "Payment and checkout questions",
      color: "bg-[#FFF0E4]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFFCF7] text-[#245C46]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#FFF2E6]">
        <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#FFE0C9]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-[#E3F1DF]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:py-16">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold tracking-wider text-[#D97748] shadow-sm">
              💚 WE'RE HERE FOR YOU
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Need a{" "}
              <span className="text-[#E98557]">
                helping paw?
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#688071]">
              Questions about your pet's goodies,
              orders, Pet ID or Paw Points?
              We're here to help make things easier
              for you and your furry best friend! 🐾
            </p>

            <a
              href="#contact-options"
              className="mt-6 inline-flex rounded-full bg-[#245C46] px-7 py-3 text-sm font-extrabold text-white transition hover:bg-[#194633]"
            >
              Get Support 💬
            </a>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto flex h-40 w-52 items-center justify-center sm:h-48 sm:w-64"
          >
            <div className="absolute h-40 w-40 rounded-full bg-[#F9DFC9] sm:h-48 sm:w-48" />
            <span className="relative text-7xl sm:text-8xl">
              🐶
            </span>
            <span className="absolute -right-2 top-2 text-4xl">
              💬
            </span>
            <span className="absolute bottom-0 left-0 text-4xl">
              🐾
            </span>
            <span className="absolute bottom-2 right-2 text-3xl">
              ✨
            </span>
          </div>
        </div>
      </section>

      <section
        id="contact-options"
        className="mx-auto max-w-6xl px-5 py-12 sm:px-8"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E98557]">
            🐾 CONTACT US
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Let's get you some help!
          </h2>

          <p className="mt-3 text-[#708476]">
            Choose the way you'd like to reach us.
          </p>
        </div>

        {/* SUPPORT CARDS */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[30px] border border-[#DDEBDC] bg-[#EAF5E9] p-7 transition hover:shadow-lg sm:p-9">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-sm">
              💬
            </div>

            <h3 className="mt-6 text-2xl font-black">
              WhatsApp Support
            </h3>

            <p className="mt-3 min-h-20 leading-7 text-[#668071]">
              Have a question? Send us a message
              about orders, products, Pet IDs or
              rewards using WhatsApp.
            </p>

            <button
              type="button"
              onClick={openWhatsApp}
              className="mt-6 w-full rounded-full bg-[#245C46] px-6 py-4 font-extrabold text-white transition hover:bg-[#194633]"
            >
              💬 Chat on WhatsApp
            </button>
          </div>

          <div className="rounded-[30px] border border-[#F3E0D2] bg-[#FFF0E4] p-7 transition hover:shadow-lg sm:p-9">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-sm">
              📞
            </div>

            <h3 className="mt-6 text-2xl font-black">
              Call Support
            </h3>

            <p className="mt-3 min-h-20 leading-7 text-[#8B786C]">
              Prefer speaking with someone?
              Tap below to open your phone's
              dialer and call our support number.
            </p>

            <button
              type="button"
              onClick={callSupport}
              className="mt-6 w-full rounded-full bg-[#E98557] px-6 py-4 font-extrabold text-white transition hover:bg-[#D97446]"
            >
              📞 Call Support
            </button>
          </div>
        </div>

        {/* HELP TOPICS */}
        <div className="mt-12 rounded-[30px] border border-[#E3EAE0] bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97748]">
            ✨ HOW WE CAN HELP
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            A little help for everything
          </h2>

          <p className="mt-3 text-sm text-[#708476]">
            From tiny questions to big concerns,
            we're here for your pet care journey.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {helpTopics.map((topic) => (
              <div
                key={topic.title}
                className={`rounded-2xl p-5 ${topic.color}`}
              >
                <span className="text-4xl">
                  {topic.icon}
                </span>

                <h3 className="mt-4 font-extrabold">
                  {topic.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#708476]">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[28px] bg-[#245C46] p-8 text-center text-white">
          <div className="text-5xl">🐾</div>

          <h2 className="mt-4 text-2xl font-black">
            Happy pets, happy people!
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#D7EBDE]">
            We're here to make every step of your
            pet care journey a little easier.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-white px-7 py-3 font-extrabold text-[#245C46]"
          >
            ← Back to Home
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E6EBE2] bg-[#F3F7EF] py-9">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 sm:flex-row">
          <p className="font-black text-[#245C46]">
            🐾 Pet PWA
          </p>

          <p className="text-sm text-[#819287]">
            © 2026 Pet PWA. Made with 💚 for pets.
          </p>
        </div>
      </footer>
    </main>
  );
}
