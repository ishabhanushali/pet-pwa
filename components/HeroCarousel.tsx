
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    title: "Everything for Happy Paws!",
    description:
      "Discover food, treats and everyday essentials for your furry family.",
    button: "Shop Now",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=85",
    background: "#FFF5E9",
    position: "center",
  },
  {
    title: "A World Made for Cats!",
    description:
      "Discover everyday favourites for your curious little friend.",
    button: "Shop for Cats",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1600&q=85",
    background: "#F0F6EE",
    position: "center",
  },
  {
    title: "Little Treats, Big Smiles!",
    description:
      "Find something special for every playful moment.",
    button: "Explore Treats",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1600&q=85",
    background: "#FFF0E4",
    position: "center",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((previous) => (previous + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrent(
      (previous) =>
        (previous - 1 + slides.length) % slides.length
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Pet PWA promotional banners"
    >
      <div className="relative h-[390px] sm:h-[440px] lg:h-[480px]">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            aria-hidden={current !== index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              current === index
                ? "z-10 opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            style={{ backgroundColor: slide.background }}
          >
            {/* PET PHOTO ON RIGHT */}
            <div className="absolute inset-y-0 right-0 w-[58%] sm:w-[55%] lg:w-[52%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt=""
                className="h-full w-full object-contain"
                style={{ objectPosition: slide.position }}
              />
            </div>

            {/* GRADIENT FOR READABLE TEXT */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FFF8EE] via-[#FFF8EE]/90 to-transparent" />

            {/* SLIDE TEXT */}
            <div className="relative mx-auto flex h-full max-w-7xl items-center px-10 sm:px-16 lg:px-20">
              <div className="max-w-[60%] sm:max-w-lg">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#C56B35] sm:text-xs">
                  🐾 PET PWA FAVOURITES
                </p>

                <h2 className="text-3xl font-black leading-tight text-[#194532] sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h2>

                <p className="mt-4 max-w-md text-xs leading-5 text-[#536E60] sm:text-base sm:leading-7">
                  {slide.description}
                </p>

                <Link
                  href={slide.href}
                  tabIndex={current === index ? 0 : -1}
                  className="mt-6 inline-block rounded-xl bg-[#205D43] px-4 py-3 text-xs font-black text-white transition hover:bg-[#174934] sm:px-8 sm:py-4 sm:text-sm"
                >
                  {slide.button} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PREVIOUS SLIDE */}
      <button
        type="button"
        onClick={previousSlide}
        aria-label="Previous banner"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl text-[#205D43] shadow-lg sm:left-5"
      >
        ‹
      </button>

      {/* NEXT SLIDE */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next banner"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl text-[#205D43] shadow-lg sm:right-5"
      >
        ›
      </button>

      {/* SLIDE INDICATORS */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Show banner ${index + 1}`}
            aria-current={current === index ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all ${
              current === index
                ? "w-8 bg-[#205D43]"
                : "w-2.5 bg-white/90"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
