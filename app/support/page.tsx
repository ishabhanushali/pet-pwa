"use client";

import Link from "next/link";

export default function SupportPage() {
  // ==================================================
  // BUSINESS CONTACT DETAILS
  // Replace these later with your real business number
  // ==================================================

  const whatsappNumber = "919999999999";
  const callNumber = "+919999999999";

  const whatsappMessage =
    "Hello! I need help with my Pet PWA order.";

  // ==================================================
  // WHATSAPP
  // ==================================================

  function openWhatsApp() {
    const message = encodeURIComponent(whatsappMessage);

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank"
    );
  }

  // ==================================================
  // CALL
  // ==================================================

  function callSupport() {
    window.location.href = `tel:${callNumber}`;
  }

  return (
    <main className="min-h-screen bg-[#fafaf7]">

      {/* NAVBAR */}

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

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
                Pet care made simple
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-bold text-gray-600 hover:text-orange-600"
          >
            ← Home
          </Link>

        </div>
      </nav>

      {/* PAGE */}

      <section className="mx-auto max-w-4xl px-6 py-12">

        {/* HEADER */}

        <div className="text-center">

          <div className="text-6xl">
            🐶
          </div>

          <p className="mt-5 font-bold uppercase tracking-wide text-orange-600">
            Customer Support
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            How can we help?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Need help with an order, product,
            Pet ID, Paw Points or your account?
            Contact our support team.
          </p>

        </div>

        {/* SUPPORT OPTIONS */}

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* WHATSAPP */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">
              💬
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              WhatsApp Support
            </h2>

            <p className="mt-2 text-gray-500">
              Chat with us on WhatsApp for
              questions about orders, products,
              Pet IDs and Paw Points.
            </p>

            <button
              type="button"
              onClick={openWhatsApp}
              className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
            >
              💬 Chat on WhatsApp
            </button>

          </div>

          {/* CALL */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl">
              📞
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Call Support
            </h2>

            <p className="mt-2 text-gray-500">
              Prefer speaking with us?
              Tap the button below to call
              our customer support team.
            </p>

            <button
              type="button"
              onClick={callSupport}
              className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              📞 Call Support
            </button>

          </div>

        </div>

        {/* HELP TOPICS */}

        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7">

          <h2 className="text-xl font-bold text-slate-900">
            We can help with
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <div className="rounded-xl bg-gray-50 p-4">
              📦 Order & delivery questions
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              🛍️ Product questions
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              🪪 Pet ID & QR support
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              🐾 Paw Points questions
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              👤 Account & profile help
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              💳 Payment questions
            </div>

          </div>

        </div>

        {/* BACK */}

        <div className="mt-8 text-center">

          <Link
            href="/"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            ← Back to Home
          </Link>

        </div>

      </section>

    </main>
  );
}